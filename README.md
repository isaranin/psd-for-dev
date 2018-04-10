psd-for-dev
===========

**psd-for-dev** is a viewer made for web developers with big help of [psd.js].

You can find [demo] here, or use [docker image].

[psd.js]: https://github.com/meltingice/psd.js
[demo]: https://apps.saranin.co/psd-viewer/
[docker image]: https://hub.docker.com/r/saranin/psd-for-dev

1. [Quick start](#quick-start)
	1. [Git](#git)
	1. [Node](#node)
	1. [Docker](#docker)
1. [Working with](#working-with)
	1. [Development](#development)
	1. [Build](#build)
	1. [Deploy](#deploy)
1. [Roadmap](#roadmap)
1. [License](#license)
1. [Creadits](#Credits)


Quick start
-----------

### Git

	git clone https://github.com/isaranin/psd-for-dev.git
	cd psd-for-dev/dist
	open index.html

### Node

Before you start, you need [node.js] and [npm].

	git clone https://github.com/isaranin/psd-for-dev.git
	cd psd-viewer
	npm install
	gulp build
	open index.html

More about [gulp], [node.js], [npm].

[gulp]: https://gulpjs.com/
[node.js]: https://nodejs.org/en/
[npm]: https://www.npmjs.com

### Docker

Before you start you should install [docker](https://www.docker.com/get-docker).

	docker run -d -p 80:80 saranin/psd-for-dev

Now you can open browser - [`http://localhost:80`](localhost:3001).

More about [docker run](https://docs.docker.com/engine/reference/run/)

Working with
--------------------
There are several gulp task to build, develop and deploy.

All task has pramater `--production` or `--development`, so you can easely switch
between ready to production version and unminifide version with sourcemaps.

### Development

For better development process we have gulp task. Task watching on files and after
changes rebuild js and css files, and relod browser.

	gulp watch

We use [browsersync] for browser reload, so you can find app here
[`localhost:8080`](localhost:8080) and browser sync monitor on
[`localhost:3001`](localhost:3001).

[browsersync]: https://browsersync.io/

### Build

This command will make new distributive at [./dist](./dist) folder.

	gulb build


### Deploy

Deploy process consist three steps, bump new version, build new distributive,
commit and push changes to main repo.

Bump uses [semver] version style, with minor/major/patch version.

	gulp deploy --minor

Will create and push dist with monir changes. Same for `--major` and `--patch`
params.

[semver]: https://semver.org/

Roadmap
-------
- [ ] Add original image view.
- [ ] Add mobile layout.
- [ ] Fixing problem with zoom and image move.
- [ ] Add typed layers.
- [ ] Add layer effects.

Credits
-------
Thanks my mom :)




*[Ivan Saranin](mailto:ivan@saranin.com)*,
*[Saranin Co](https://saranin.co)*
