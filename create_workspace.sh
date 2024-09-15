#!/bin/sh

if [ -z "$1" ]
then
        echo "ERROR: Workspace name not specified"
        exit 1
fi

echo "=====CREATING WORKSPACE $1====="
mkdir -p "$1"/assets/img                \
         "$1"/assets/video              \
         "$1"/workspace/files_raw       \
         "$1"/workspace/files_modified  \
         "$1"/workspace/exploits        \
         "$1"/workspace/scans           \
         "$1"/workspace/services        
         
touch "$1"/"$1"\ -\ INCOMPLETE.md
touch "$1"/workspace/"$1"\ -\ INFO.md
echo "=====DONE CREATING WORKSPACE $1====="
