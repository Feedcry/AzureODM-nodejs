REPORTER=spec
check: test
test:
	@NODE_ENV=testing ./node_modules/.bin/mocha \
		--reporter $(REPORTER)

.PHONY: test
