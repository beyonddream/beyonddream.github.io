---
title: Bulk move repository forks across owners under a single github user account
date: 2025-06-03
---

[[toc]]

## Introduction

I implemented a python script to bulk move repository forks from my personal account to another organization account owned by me using same login account. I worked on it to appease my OCD after realizing the number of forked repositories had proliferated too much compared to my personal repositories. So I decided to de-clutter them from my view on github home page and give space and focus to my personal projects. But I couldn't bring myself to delete them all because these forks were interesting enough to me at some point to warrant a fork and I didn't want to lose them. So, I wrote a script as any software engineer is wont to do to move them out of my sight but still accessible if and when I need them.

## Process

Even a simple programming task as this was ripe with few interesting cases that I had to handle:

- There can be identical forked projects present in both source and destination account and the script should not try to move them. In those scenarios, script should delete the forked copy from the source.

- The Github client library provided basic operations like fetch repo, check if a repo is a fork or not, delete repo etc., but it doesn't provide any method for moving a repo. Instead, I used `urllib` to access specific `api.github.com` endpoint to perform the move operation.

- Calling Github API for every forked repo comes with a peril of hitting the API throttling limit. One could use the value from `X-RateLimit-*` response header to wait for a stipulated duration before calling the API again but I went with the simplest option by using `time.sleep(...)`.

- To compare if same repo is present in both source and destination, I used `Set` datastructure's `intersection` method. The element of the set is a custom class extending `Repository` that overrode `__eq__` and `__hash__` to use just the repo name.

## Code

The entire script is reproduced below.

```python
#!/usr/bin/env python3

# Tested with python 3.8.5
# Dependency:
# 
# pip install PyGithub
#
# Usage:
#
# chmod +x bulk_move_forks.py
# GITHUB_ACCESS_TOKEN=<your token> MIGRATE_FROM_OWNER=<from_repo|org> MIGRATE_TO_OWNER=<to_repo|org>  ./bulk_move_forks.py
# 
# Note: This only supports moving between two login's from within a current user account since that is my use-case.
#
# License:
# MIT License

import os
import sys
import warnings
import json
import time
from github import Github, GithubException
from github.Repository import Repository
from urllib import request
from urllib import parse
from urllib.error import HTTPError

def start():
    GITHUB_ACCESS_TOKEN = os.getenv('GITHUB_ACCESS_TOKEN')
    MIGRATE_FROM_OWNER = os.getenv('MIGRATE_FROM_OWNER')
    MIGRATE_TO_OWNER = os.getenv('MIGRATE_TO_OWNER')

    if not GITHUB_ACCESS_TOKEN:
        sys.exit('Cannot proceed without Github Access Token. Exiting...')

    _process_current_user_forks(GITHUB_ACCESS_TOKEN, MIGRATE_FROM_OWNER,
                              MIGRATE_TO_OWNER)

def _process_current_user_forks(access_token, from_owner, to_owner):
    g = Github(access_token)
    u = g.get_user()

    from_repos = set()
    to_repos = set()

    from_count = 0
    to_count = 0

    try:
        for repo in u.get_repos():
            if repo.fork: # only consider forks to migrate
                if repo.owner.login == from_owner:
                    print('{}: repo {} is a fork.'.format(from_owner, repo.full_name))
                    from_count += 1
                    from_repos.add(CustomComparatorRepository(repo))
                elif repo.owner.login == to_owner:
                    print('{}: repo {} is a fork.'.format(to_owner, repo.full_name))
                    to_count += 1
                    to_repos.add(CustomComparatorRepository(repo))
                else:
                    warnings.warn('user {} doesn\'t own {} and {}. Skipping...'.format(u.login, from_owner, to_owner))

        print('Total forks for {}/{} = {}'.format(u.login, from_owner, from_count))
        print('Total forks for {}/{} = {}'.format(u.login, to_owner, to_count))

        # Step 1) move repos - ignore repo in from_owner that is already present in to_owner
        repos_to_move = from_repos.difference(to_repos)
        print('Repo in {} not in {} is {}. Total - {}'.format(from_owner,
                                                                to_owner,
                                                                repos_to_move,
                                                                len(repos_to_move)))
        _move_repos(access_token, repos_to_move, u, from_owner, to_owner)

        # Step 2) remove the duplicate repo in from_owner since it is already present
        # in to_owner
        repos_to_delete = from_repos.intersection(to_repos)
        print('Repo in {} and in {} is {}. Total - {}'.format(from_owner,
                                                                to_owner,
                                                                repos_to_delete,
                                                                len(repos_to_delete)))
        _delete_repos(repos_to_delete)

    except GithubException as ge:
        sys.exit('Error accessing github API - {}'.format(ge))

    print('Done...')

def _delete_repos(repos_to_delete):
    for repo in repos_to_delete:
        print('Deleting {}'.format(repo.name))
        repo.delete()
        print('Successfully deleted.')

def _move_repos(access_token, repos_to_move, user, from_owner, to_owner):
    # use urllib since pyGithub doesn't support Repo move api :(
    from_owner = from_owner.split('/')[0]
    to_owner = to_owner.split('/')[0]
    for repo in repos_to_move:
        url = 'https://api.github.com/repos/{owner}/{repo}/transfer'.format(owner=from_owner,repo=repo.name)
        data = {'new_owner': to_owner}
        body = json.dumps(data).encode('utf-8')
        headers = {'Content-Type': 'application/json', 'Authorization':
                   'token {}'.format(access_token)}
        r = request.Request(url,
                            data=body, headers=headers)
        #transfer ownership
        transfer_response_msg = 'transferring {} from owner {} to owner {}'.format(repo.name, from_owner, to_owner)
        try:
            response = request.urlopen(r)
            if response.getcode() == 202:
                print('Succeeded in '+transfer_response_msg)
            else:
                print('Failed in '+transfer_response_msg)
        except HTTPError as e:
            print('Failed in '+ transfer_response_msg)
            print('API Error response - {}'.format(e))

        # sleep for 1 second so that we don't overload the github api (we
        # could parse the response header for X-RateLimit-* but this would do
        # for now (:=
        time.sleep(1)

class CustomComparatorRepository(Repository):
    def __init__(self, repo):
        self.repo = repo
        # simple hack to avoid writing pass-through's since we only need few
        # attributes.
        self._name = repo._name
        self._requester = repo._requester
        self._url = repo._url
    def __eq__(self, other):
        return self.repo.name == other.repo.name
    def __hash__(self):
        return hash(self.repo.name)
    def __repr__(self):
        return Repository.__repr__(self.repo)

if __name__ == '__main__':
    start()
```


