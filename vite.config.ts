import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from "child_process";

function parseChangelog() {
    return execSync("git log --grep \"^Changelog: \" -10")
        .toString()
        .split(/^commit /m)
        .slice(1)
        .map((commit) => {
            const changelogIndex = commit.indexOf("    Changelog: ");
            if (changelogIndex === -1) {
                throw `Changelog not found in commit:\n${commit}`;
            }
            const dateString = commit.match(/^Date:   (.*)$/m)?.[1];
            if (!dateString) {
                throw `Date not found in commit:\n${commit}`;
            }
            const dateValue = new Date(dateString);
            const date = dateValue.toISOString().split('T')[0];
            const id = commit.substring(0, commit.indexOf("\n"));
            const message = commit
                .substring(changelogIndex + 15)
                .replaceAll("\n    ", "\n")
                .trim();
            return {
                id,
                message,
                date,
            };
        })
        .filter((changelog) => changelog.message);
}

const getContributorsForRepo = async (repoName) => {
    const contributorsData = await fetch(`https://api.github.com/repos/LiveSplit/${repoName}/contributors`, {
        // headers: {
        //     "Authorization": env.GITHUB_TOKEN ? `Bearer ${env.GITHUB_TOKEN}` : undefined,
        // },
    });
    return contributorsData.json();
}

const lsoContributorsList = await getContributorsForRepo("LiveSplitOne");
const coreContributorsList = await getContributorsForRepo("livesplit-core");

const coreContributorsMap: { [key: string]: any } = {};
for (const coreContributor of coreContributorsList) {
    if (coreContributor.type === "User" && !coreContributor.login.includes("dependabot")) {
        coreContributorsMap[coreContributor.login] = coreContributor;
    }
}

for (let lsoContributor of lsoContributorsList) {
    const existingContributor = coreContributorsMap[lsoContributor.login];
    if (existingContributor) {
        existingContributor.contributions += lsoContributor.contributions;
    } else if (lsoContributor.type === "User" && !lsoContributor.login.includes("dependabot")) {
        coreContributorsMap[lsoContributor.login] = lsoContributor;
    }
}

const contributorsList = Object.values(coreContributorsMap)
    // Sort by contributions, but fallback to alphabetical order for the
    // same amount of contributions
    .sort((a, b) => a.login > b.login ? 1 : b.login > a.login ? -1 : 0)
    .sort((a, b) => b.contributions - a.contributions)
    .map((user) => {
        return { id: user.id, name: user.login };
    });
const commitHash = execSync("git rev-parse --short HEAD").toString();
const date = new Date().toISOString().replace("T", " ").replace(/\..+/, " UTC");

const changelog = parseChangelog();

// https://vite.dev/config/
export default defineConfig({
    build: { target: 'esnext', outDir: "dist-vite" },
    define: {
        BUILD_DATE: JSON.stringify(date),
        COMMIT_HASH: JSON.stringify(commitHash),
        CONTRIBUTORS_LIST: JSON.stringify(contributorsList),
        CHANGELOG: JSON.stringify(changelog),
    },
    plugins: [
        react({
            babel: {
                plugins: ["@babel/plugin-proposal-explicit-resource-management"],
            }
        }),
        VitePWA({
            strategies: "generateSW",
            workbox: {
                clientsClaim: true,
                skipWaiting: true,
                maximumFileSizeToCacheInBytes: 100 * 1024 * 1024,
                // exclude: [
                //     /^assets/,
                //     /\.LICENSE\.txt$/,
                // ],

                runtimeCaching: [{
                    urlPattern: (context) => {
                        return self.origin === context.url.origin &&
                            context.url.pathname.startsWith("/assets/");
                    },
                    handler: "CacheFirst",
                }],
            }
        }),
    ],
})
