# This script takes care of testing your crate

set -ex

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"

doCompile() {
    (cd livesplit-core && cross rustc -p livesplit --target $TARGET --release -- -C opt-level=z)
    (cd livesplit-core/capi/bind_gen && cargo run)

    cp livesplit-core/target/asmjs-unknown-emscripten/release/livesplit*.js* src/livesplit_core.js
    cat livesplit-core/capi/js/exports.js >> src/livesplit_core.js
    cp livesplit-core/capi/bindings/emscripten/livesplit_core.ts src/livesplit.ts

    npm install
    webpack -p
}

if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" ]; then
    echo "Skipping deploy; just doing a build."
    doCompile
    exit 0
fi

doCompile

git config --global user.email "christopher.serr@gmail.com"
git config --global user.name "Travis CI"
git checkout -b gh-pages
git add -f dist
git add -f src/livesplit_core.js
git commit -m "gh pages"

ENCRYPTED_KEY_VAR="encrypted_${ENCRYPTION_LABEL}_key"
ENCRYPTED_IV_VAR="encrypted_${ENCRYPTION_LABEL}_iv"
ENCRYPTED_KEY=${!ENCRYPTED_KEY_VAR}
ENCRYPTED_IV=${!ENCRYPTED_IV_VAR}
openssl aes-256-cbc -K $ENCRYPTED_KEY -iv $ENCRYPTED_IV -in ci/deploy_key.enc -out deploy_key -d
chmod 600 deploy_key
eval `ssh-agent -s`
ssh-add deploy_key

git remote set-url origin git@github.com:LiveSplit/LiveSplitOne.git

git push origin gh-pages -f
