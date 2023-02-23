const path = require('path');
const fs = require('fs-extra');
const chalk= require('chalk');
const Inquirer = require('inquirer');

const cwd = process.cwd();

const ora = require('ora');
const api = require('../api/interface/index.js');

const util = require('util');
const downloadGitRepo = require('download-git-repo');


class Creator {
    constructor(projectName, options) {
        this.projectName = projectName;
        this.options = options;
    }

    // 创建
    async create() {
        const isOverwrite = await this.handleDirectory();
        if(!isOverwrite) return;
        await this.getCollectRepo();
    }

    // 处理是否有相同目录
    async handleDirectory() {
        const targetDirectory = path.join(cwd, this.projectName);
        // 如果目录中存在了需要创建的目录
        if (fs.existsSync(targetDirectory)) {
            if (this.options.force==true) {
                await fs.remove(targetDirectory);
            } else {
                let { isOverwrite } = await new Inquirer.prompt([
                    {
                        name: 'isOverwrite',
                        type: 'list',
                        message: '是否强制覆盖已存在的同名目录？',
                        choices: [
                            {
                                name: '覆盖',
                                value: true
                            },
                            {
                                name: '不覆盖',
                                value: false
                            }
                        ]
                    }
                ]);
                if (isOverwrite) {
                    await fs.remove(targetDirectory);
                } else {
                    console.log(chalk.red.bold('不覆盖文件夹，创建终止'));
                    return false;
                }
            }
        };
        return true;
    }

    // 获取可拉取的仓库列表
    async getCollectRepo() {
        const loading = ora('正在获取模版信息...');
        loading.start();
        const list = [ 'vue2-template', 'vue3-template' ];
        loading.succeed();
        const collectTemplateNameList = list;
        let { choiceTemplateName } = await new Inquirer.prompt([
            {
                name: 'choiceTemplateName',
                type: 'list',
                message: '请选择模版',
                choices: collectTemplateNameList
            }
        ]);
        this.downloadTemplate(choiceTemplateName);
    }

    // 下载仓库
    async downloadTemplate(choiceTemplateName) {
        this.downloadGitRepo = util.promisify(downloadGitRepo);
        const templateUrl = `Giswin/${choiceTemplateName}`;
        const loading = ora('正在拉取模版...');
        loading.start();
        await this.downloadGitRepo(templateUrl, path.join(cwd, this.projectName));
        loading.succeed();
    }
    

}

module.exports = async function (projectName, options) {
    const creator = new Creator(projectName, options);
    await creator.create();
}
