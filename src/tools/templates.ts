import fs from "fs";
import handlebars from "handlebars";
import path from "path";

export default class Templates {
    public list: { [key: string]: handlebars.TemplateDelegate } = {};

    constructor() {
        this.initialize();
        fs.watch(path.join(__dirname, "../", "../", "/templates"), this.initialize);
    }

    private initialize = () => {
        const files = fs.readdirSync(path.join(__dirname, "../", "../", "/templates"));
        this.list = {};
        files.forEach((fileName) => {
            this.openTemplate(fileName);
        });
    }

    private openTemplate = (fileName: string) => {
        const templateString: string = fs.readFileSync(
            path.join(__dirname, "../", "../", "/templates", fileName), "utf-8");
        const template = handlebars.compile(templateString);
        this.list[fileName.split(".")[0]] = template;
    }
}