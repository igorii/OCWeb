#!/bin/bash

until node app.js
do
    echo "Server crashed, restarting" >&2
done
