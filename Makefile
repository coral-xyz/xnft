.PHONY: bootstrap

bootstrap:
	@echo "installing submodules"
	git submodule init
	git submodule update
	@echo "building token-metadata program"
	cd deps/metaplex-program-library/token-metadata/program && cargo build-bpf && cd ../../../../
