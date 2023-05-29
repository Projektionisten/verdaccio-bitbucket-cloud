const AuthCustomPlugin = require('./lib/src/index.js').default;

const logger = {
	warn: (message) => {
		console.log('Warn:', message);
	},
	debug: (message) => {
		console.log('Debug:', message);
	}
}

const authPlugin = new AuthCustomPlugin({
	allow: 'Crylion(owner), projektionisten-developers(owner|collaborator), $all',
	hashPassword: true,
	cache: 'in-memory'
}, {logger: logger})

authPlugin.authenticate('crylion', 'ATBBEbc3DE3v5E2KxmdWjEHPutRp6F371B97', (error, groups) => {
	console.log('Error', error);
	console.log('groups', groups);
})
