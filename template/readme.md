# Maxymiser Workflow
A mechanism to speed up maxymiser test development without having to copy-paste-save

## To Initialise
```
npm i maxymiser-workflow
node ./node_modules/maxymiser-workflow/bin/maxymiser-workflow.js init

npm run init
```

| Option | Definition |
| ------ | ---------- |
| `-h`, `--help` | Print usage Information. |
| `-f`, `--force` |Forces copying of initial files. |
| `-c`, `--campaign` | Campaign name (will default to package name). |


## To generate the file
```
npm run generate
npm run generate variant-name
```

## To dev
```
npm run watch
```

Fiddler rule
`regex:(?ix)^http://service.maxymiser.net/cg/v5/`
to
`PATH/dist/replace_cg_v5.js`

## To Build
```
npm run build
```
