# !/bin/bash
# File:        /unused.sh
# Description:

# Date        By     Comments
# ----------  -----  ------------------------------
# 2023-12-31  C2RLO  Initial

DIRNAME=${1:-.}
cd $DIRNAME

FILES=$(mktemp)
PACKAGES=$(mktemp)

# use fd
# https://github.com/sharkdp/fd

function check {
  cat package.json | jq "{} + .$1 | keys" | sed -n 's/.*"\(.*\)".*/\1/p' >$PACKAGES
  echo "--------------------------"
  echo "Checking $1..."
  fd -t f '(js|mjs|ts|json)$' >$FILES
  while read PACKAGE; do
    if [ -d "node_modules/${PACKAGE}" ]; then
      fd -t f '(js|mjs|ts|json)$' node_modules/${PACKAGE} >>$FILES
    fi
    RES=$(cat $FILES | xargs -I {} egrep -i -w "(import|require|loader|plugins|${PACKAGE}).*['\"](${PACKAGE}|.?\d+)[\"']" '{}' | wc -l)

    if [ $RES = 0 ]; then
      echo -e "UNUSED\t\t $PACKAGE"
    else
      echo -e "USED ($RES)\t $PACKAGE"
    fi
  done <$PACKAGES
}

check "dependencies"
check "devDependencies"
check "peerDependencies"
chmod +x unus
