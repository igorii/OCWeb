#!/bin/sh

# create database directory
if [ ! -d database ]
then
    mkdir database
fi

# Grab the database from timthornton.net
wget timthornton.net/comp2406/mondb.tar.gz -O database/mondb.tar.gz

# Extract the database and remove archive
cd database
tar -zxvf mondb.tar.gz
rm mondb.tar.gz
cd ..
