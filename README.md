# Probability SDK

[Probability](https://probability.nz) is an app for playing tabletop & board games.

## TODO

- [ ] Ignore invalid peer presence updates, and log dev warning.
- [ ] Upload the schema to https://registry.probability.nz/npm/@probability-nz/analog/-/analog-0.1.0.tgz/dist/analog.json.

---

## Game state

Game state is kept in a shared [`document`](https://automerge.org/docs/reference/concepts/#documents).

When you drag a piece, you send temporary `presence` data, showing our intended move. When you drop, you update the `document`, adding the move to the permanent history.

### Document format

Pieces are stacked on each other, and positioned relatively.

```jsonc
// A token, sitting on a card, sitting on a chessboard
{
  "$schema": "https://registry.probability.nz/npm/@probability-nz/analog/-/analog-0.1.0.tgz/dist/analog.json",
  "templates": {},
  "children": {
    "name": "Chess Board",
    "position": [0, 0.1, 0],
    "locked": true,
    "src": "Chess_Board.glb",
    "children": [
      {
        "name": "card",
        "position": [0, 0.002, 0],
        "children": [
          {
            "name": "pawn",
            "position": [0, 0.3, 0],
            "children": []
          }
        ]
      }
    ]
  }
```

## Game templates

Game templates are a zip file with a `probability.json` manifest of scenarios, images for cards, glTF or GLB 3D models, and a `package.json`.

An example chess game is available [here](https://github.com/garbo-succus/chess) ([zip file](https://github.com/garbo-succus/chess/archive/refs/heads/main.zip)). There is also a [Checkers](https://github.com/garbo-succus/checkers) example.

### Probability catalog

Zip files can be uploaded to the catalog at [mod.io/g/probability](https://mod.io/g/probability).

* The first image in the gallery is used as an icon (minimum 400x400px).
* The "Content listing image" is used as a header background.
* Underscores in usernames are converted to spaces.

### Self-hosting

You can self-host an unzipped game template, and link to it from your community.
Your web host must have CORS headers for `probability.nz`.

`https://probability.nz/play#template={folder URL}`

For example, [Play Chess](https://probability.nz/play#template=https://raw.githubusercontent.com/garbo-succus/chess/main/).

### Templates

Templates are a way to define reusable pieces of configuration. They can inherit from other templates, and share syntax with pieces, minus a "children" property.

```jsonc
{
  "$schema": "https://registry.probability.nz/npm/@probability-nz/analog/-/analog-0.1.0.tgz/dist/analog.json",
  "templates": {
    "defaults": {
      "scale": [0.1, 0.1, 0.1],
    },
    "redToken": {
      "template": "defaults",
      "name": "Red token",
      "src": "redToken.glb"
    }
  },
  "children": [
    { "template": "redToken", "position": [0.0, 0, 0] },
    { "template": "redToken", "position": [0.1, 0, 0] },
    { "template": "redToken", "position": [0.2, 0, 0] }
  ]
}
```

### `probability.json`
The manifest file is similar to a game state, with a `states` array on the root, instead of a `children` array. This contains one or more game scenarios.
```jsonc
// 2-4 and 4-8 player scenarios
{
  "$schema": "https://registry.probability.nz/npm/@probability-nz/analog/-/analog-0.1.0.tgz/dist/analog.json",
  "templates": {
    "token": { "src": "token.glb" }
  },
  "states": [
    {
      "name": "2-4 player setup",
      "children": [
        {
          "name": "Game board",
          "src": "gameboard.glb",
          "children": [
            { "template": "token" },
            { "template": "token" },
            { "template": "token" },
            { "template": "token" }
          ]
        }
      ]
    },
    {
      "name": "4-8 player setup",
      "children": [
        {
          "name": "Game board",
          "src": "gameboard.glb",
          "children": [
            { "template": "token" },
            { "template": "token" },
            { "template": "token" },
            { "template": "token" },
            { "template": "token" },
            { "template": "token" },
            { "template": "token" },
            { "template": "token" }
          ]
        }
      ]
    }
  ]
}
```

### `package.json`

`package.json` must contain a `main` field, with a relative path to the manifest.

```jsonc
{
  "name": "Your Game Name",
  "version": "0.0.0",
  "main": "probability.json",
}
```
