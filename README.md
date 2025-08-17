# kdo-app

It's a little app for sharing your gift list. It uses GitHub Gist as backend-ish to provide a clean interface to
reserve presents.

_kdo, pronounced `/kado/` in French, has the same pronunciation as 'cadeau' which means 'present' in French._

The view where the _admin_ can modify/create a gift:

![img.png](ui.png)

The users have a similar view but, instead of modifying/creating, they can reserve gifts.

## How to set up

1. You will need to create a GitHub API key to access the GitHub Gist.
   See [GitHub doc](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token).
2. Create a new GitHub Gist named `kdo.json` containing `{}`,
3. Fork the repo (you won't be able to use my deployment on GitHub Pages,
   see [Technical information](#technical-information))
4. Update the `valid_key`, `valid_gist` arrays in `App.tsx` with the sha512 values of your key(s)/gist id(s).
5. Push, the project will be published to your GitHub Pages!

## How to use

Go to https://[your github name].github.io/kdo/?k=[github api key]&g=[gist id]&n=admin. There you can edit/create new gift,
generate new link to share the list. Share the link of the app with Santa Claus
_and hope your small ugly python project didn't put you on the naughty list_.

If you want to keep _part_ of the surprise, just make sure to only go on the admin page (link above) and not on the link
that you share.

## Technical information

This is a small React project based on the vite template. It uses a GitHub API key and a GitHub Gist id to query
a json file to display the gift list. This makes it possible to host the website on GitHub Pages.
To ensure your deployment on GitHub Pages is not unused illegitimately (for instance by trying to inject js via a
crafted GitHub Gist), the specified GitHub Gist is checked against a hash list of validate ids. There are also
steps taken to prevent html injection in the first place.
As there is no easy way to prevent illegitimate usage of the GitHub API key if stored in the source code, a
similar mechanism ensure that only your GitHub API key(s) can be used on your deployment.

## Contributions

Any contributions are welcome. Please check the issues and pull requests before submitting anything.
Also keep in mind that this is a side quest, and I'll most likely disregard any 'big' PR trying to add significant
complexity.

## LICENSE

This software is licensed under the GNU GENERAL PUBLIC LICENSE v3.0