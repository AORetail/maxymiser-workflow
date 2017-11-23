# Maxymiser Workflow
A mechanism to speed up maxymiser test development without having to copy-paste-save

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
