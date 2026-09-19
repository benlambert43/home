A post about code, to show how fenced blocks and `inline code` are laid out.

## TypeScript

```ts
type Result<Value> =
  { ok: true; value: Value } | { ok: false; message: string };

const parsePort = (input: string): Result<number> => {
  const port = Number(input);

  return Number.isInteger(port) && port > 0 && port < 65536
    ? { ok: true, value: port }
    : { ok: false, message: `${input} is not a port.` };
};
```

## Shell

```sh
docker compose up -d
npm run dev:server
npm run seed -- 40
```

## JSON

```json
{
  "name": "home",
  "private": true,
  "workspaces": ["home-shared", "home-server", "home-web-ui"]
}
```

## A very long line

Code is never wrapped, so a long line scrolls sideways inside its block:

```txt
GET /api/v1/posts?page=1&pageSize=10 -> 200 OK { "error": false, "posts": [ ... ], "pagination": { "page": 1, "pageSize": 10, "totalPosts": 30, "totalPages": 3, "hasMore": true } }
```

## HTML and Markdown, quoted rather than used

Raw HTML is not allowed in a post, but it is fine inside a code block, where it is only text:

```html
<figure>
  <img src="./images/not-a-real-image.png" alt="This is never loaded" />
  <figcaption>Only an example.</figcaption>
</figure>
```

The same goes for Markdown. The image below is quoted, not used, so the post does not need to have it:

~~~md
![Quoted, not shown](./images/also-not-real.png)

```ts
const fenced = "a backtick fence inside a tilde fence";
```
~~~

Inline code is left alone too: `<strong>not bold</strong>` and `![not an image](./images/nope.png)`.
