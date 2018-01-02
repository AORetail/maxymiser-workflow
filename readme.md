# Maxymiser Workflow

A mechanism to speed up maxymiser test development without having to copy-paste-save

## To Initialise

```
npm i maxymiser-workflow

npm run init-workflow
```

| Option | Definition |
| ------ | ---------- |
| `-h`, `--help` | Print usage Information. |
| `-t, --template` | Copy template files. |
| `-f, --force` | Forces copying of template files (will overwrite). |
| `-c`, `--campaign` | Campaign name (will default to package name). |

`init` will run [`extract`](#to-extract-from-a-url) unless `--template` or `--force` is provided. Then it will run [`generate`](#to-generate-the-file).

## To extract from a URL

```
npm run extract
```

Follow the onscreen questions.
You will need the full URL of `//service.maxymiser.net/cg/v5/` get this from the devtools in your favourite browser or a Web Debugging Proxy.

## To generate the file

```
npm run generate
npm run generate -- --variant=variant-name
```

| Option | Definition |
| ------ | ---------- |
| `-h`, `--help` | Print usage Information. |
| `-v`, `--variant` | Variant to want to generate for |
| `-a`, `--auto` | Uses first vaiant it finds |

If no variant is provided (`--variant=<name>`). An interactive list will prompt for action.
If `--auto` is use it the generate for the first variant it finds.

## To dev

```
npm run watch
```

You will need to use a Web Debugging Proxy like [Fidder](https://www.telerik.com/fiddler) or [Charles](https://www.charlesproxy.com/) to use the file generated.

Example Fiddler rule
`regex:(?ix)^https?://service.maxymiser.net/cg/v5/`
to
`PATH/dist/replace_cg_v5.js`

## To Build

```
npm run build
```

This will build transform all of the script files to be copy-and-pasted into Maxymiser.

## TODO

* Comments
* How/What to Test
* OS Testing

## Roadmap

* Extract from `http://service.maxymiser.net/cg/v5/` [DONE].
* Generate from page. (get and parse `http://service.maxymiser.net/cg/v5/`).
* Scaffold from git-repo
* Be a Proxy rather than using one