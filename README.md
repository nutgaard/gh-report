# GH-Report

Simple tool to extract a report of a teams PRs since a timestamp.

## Usage 
```
GH-Report
Automatically look for PR merges the last week for a given team.

zx src/get-last-week.mjs myorg/myteam

Options:
    -l, --limit:    Extend the number of PRs checked for each repo. 
                    Default: 10
             
    -d, --since:    Set the cutoff for which PRs er relevant.
                    Default: now() - 1w
                    Example: 2021-09-15
                 
    -r, --reporter: Set the reporter format
                    Default: terminal
                    Options: terminal, markdown
```
