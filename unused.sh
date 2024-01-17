#!/usr/bin/bash
# File:        /unused.sh
# Description:

# Date        By     Comments
# ----------  -----  ------------------------------
# 2023-12-31  C2RLO  Initial

v_date=$(date +"%Y-%m-%d")

export TERM=xterm-color
export GREP_OPTIONS='--color=auto' GREP_COLOR='1;32'
export CLICOLOR=1
export LSCOLORS=ExFxCxDxBxegedabagacad

export COLOR_NC='\e[0m' # No Color
export COLOR_BLACK='\e[0;30m'
export COLOR_GRAY='\e[1;30m'
export COLOR_RED='\e[0;31m'
export COLOR_LIGHT_RED='\e[1;31m'
export COLOR_GREEN='\e[0;32m'
export COLOR_LIGHT_GREEN='\e[1;32m'
export COLOR_BROWN='\e[0;33m'
export COLOR_YELLOW='\e[1;33m'
export COLOR_BLUE='\e[0;34m'
export COLOR_LIGHT_BLUE='\e[1;34m'
export COLOR_PURPLE='\e[0;35m'
export COLOR_LIGHT_PURPLE='\e[1;35m'
export COLOR_CYAN='\e[0;36m'
export COLOR_LIGHT_CYAN='\e[1;36m'
export COLOR_LIGHT_GRAY='\e[0;37m'
export COLOR_WHITE='\e[1;37m'

DIRNAME=${1:-.}
cd $DIRNAME

FILES=$(mktemp)
PACKAGES=$(mktemp)

# use fd
# https://github.com/sharkdp/fd

function check {
  cat package.json | jq "{} + .$1 | keys" | sed -n 's/.*"\(.*\)".*/\1/p' >$PACKAGES
  echo ""
  echo "Checking $1..."
  echo "--------------------------"

  fd -t f '(js|mjs|ts|json|eslintrc)$' >$FILES
  # cat $FILE >all-files.csv

  while read PACKAGE; do
    if [ -d "node_modules/${PACKAGE}" ]; then
      fd -t f '(js|mjs|ts|json)$' node_modules/${PACKAGE} >>$FILES
    fi
    RES=$(cat $FILES | xargs -I {} egrep -i -w "(import|require|loader|plugins|${PACKAGE}).*[\'\"](${PACKAGE}|.?\d+)[\"\']" '{}' | wc -l)

    if [ $RES = 0 ]; then
      printf "${COLOR_RED}UNUSED${COLOR_NC}\t\t %-20s npm remove %-20s\n" $PACKAGE $PACKAGE
    else
      printf "${COLOR_GREEN}USED${COLOR_NC} (%3s) %-20s\n" $RES $PACKAGE
    fi
  done <$PACKAGES
}

check "dependencies"
check "devDependencies"
check "peerDependencies"
