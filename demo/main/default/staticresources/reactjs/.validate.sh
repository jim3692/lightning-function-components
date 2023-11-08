#!/usr/bin/env bash

FILE='meta.json'
QUERY='.[] | .file + "\t" + .sha512'

MESSAGE_PASS='[Pass]'
MESSAGE_INVALID_SIGNATURE='[Invalid Signature]'

hasError=0

sha512OfFile() {
    cat $1 \
    | openssl dgst -binary -sha512 \
    | openssl base64 -A
}

while read file sha512; do
    if [ "$(sha512OfFile $file)" == "$sha512" ]; then
        echo "$MESSAGE_PASS $file"
    else
        echo "$MESSAGE_INVALID_SIGNATURE $file"
        hasError=1
    fi
done <<< "$(jq -r "$QUERY" "$FILE")"

if [ "$hasError" -eq 1 ]; then
    exit 1
fi
