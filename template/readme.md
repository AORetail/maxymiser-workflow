# Maxymiser Workflow

A mechanism to speed up maxymiser test development without having to copy-paste-save

## To Initialise

```shell-script
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

```shell-script
npm run extract
```

Follow the onscreen questions.
You will need the full URL of `//service.maxymiser.net/cg/v5/` get this from the devtools in your favourite browser or a Web Debugging Proxy.

## To generate the file

```shell-script
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

```shell-script
npm run watch
```

You will need to use a Web Debugging Proxy like [Fidder](https://www.telerik.com/fiddler) or [Charles](https://www.charlesproxy.com/) to use the file generated.

Example Fiddler rule
`regex:(?ix)^https?://service.maxymiser.net/cg/v5/`
to
`PATH/dist/replace_cg_v5.js`

## To Build

```shell-script
npm run build
```

This will build transform all of the script files to be copy-and-pasted into Maxymiser.
