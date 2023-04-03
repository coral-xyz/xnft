.PHONY: dependencies

dependencies:
	@echo "installing npm packages"
	yarn
	@echo "installing submodules"
	git submodule update --recursive --init
	@echo "building token-metadata program"
	cd deps/metaplex-program-library/token-metadata/program && cargo build-bpf && cd ../../../../
