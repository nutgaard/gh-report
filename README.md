# GH-Report

Simple tool to extract a report of a teams PRs since a timestamp.

## Usage 
```
GH-Report
Automatically look for PR merges the last week for a given team.

zx src/index.mjs myorg/myteam

Options:
    -l, --limit:    Extend the number of PRs checked for each repo. 
                    Default: 10
             
    -d, --since:    Set the cutoff for which PRs er relevant.
                    Default: now() - 1w
                    Example: 2021-09-15
                 
    -r, --reporter: Set the reporter format
                    Default: terminal
                    Options: terminal, markdown
                    
Examples:
    Specify the cutoff for relevant PRs 
    zx src/index.mjs myorg/myteam --since 2021-09-01
    
    Increase the limit when fetching PRs for github 
    zx src/index.mjs myorg/myteam --limit 20
    
    Print the report in markdown 
    zx src/index.mjs myorg/myteam --reporter markdown
```
