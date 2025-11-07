import { build } from "@lib/build";
import { buildCss } from "@lib/build-css";
import { serve } from "@lib/serve";
import { watch } from "fs";

const start = () => {
	build();
	buildCss();
};

start();
serve();
watch("src", { recursive: true }, (event, filename) => {
	start();
});
