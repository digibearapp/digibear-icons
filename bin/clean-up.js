const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const _ = require('lodash');
const constants = require("./constants");
const paths = require("./paths.js");
const { toCamelCase } = require("./utils.js");
const { optimize } = require("svgo");
// var exec = require('child_process').exec, child;
const execSync = require('child_process').execSync;
var { version } = require('../package.json');

function cleanUp() {
    const folders = fs.readdirSync(paths.ICONS_PATH, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    const diffs = checkConsistencyAcrossFolders(folders);
    if (diffs.size == 0) {
        cleanUpSVGs(folders);
    }
}

function checkConsistencyAcrossFolders(folders) {
    console.log(`Checking file consistency between the following ${folders.length} dirs in the current path : \n${folders}`);
    const diffs = new Set([]);
    folders.slice(1).forEach((folder) => {
        const diffsInFolder = checkConsistency(folders[0], folder);
        diffsInFolder.forEach(diffInFolder => diffs.add(diffInFolder));
    });
    if (diffs.size > 0) {
        console.log(`${chalk.inverse.red(" ERROR ")} Found ${diffs.size} difference${diffs.size > 1 ? "s" : ""} :`);
        diffs.forEach((diff, i) => console.log(`${chalk.inverse.red(" ERROR ")} ${new Array(...diffs).join('\n')}`));
    } else {
        console.log(`${chalk.inverse.green(" OK ")} 0 differences found 👍`);
    }
    return diffs;
}

function checkConsistency(refFolder, folder) {
    const refSvgFiles = fs.readdirSync(path.join(paths.ICONS_PATH, refFolder), { withFileTypes: true })
        .filter(dirent => !dirent.isDirectory() && path.extname(dirent.name).toLowerCase() === constants.EXTENSION)
        .map(dirent => dirent.name);
    const svgFiles = fs.readdirSync(path.join(paths.ICONS_PATH, folder), { withFileTypes: true })
        .filter(dirent => !dirent.isDirectory() && path.extname(dirent.name).toLowerCase() === constants.EXTENSION)
        .map(dirent => dirent.name);

    const diffs1 = _.difference(refSvgFiles, svgFiles);
    const diffs2 = _.difference(svgFiles, refSvgFiles);

    return new Array(...diffs1, ...diffs2);
}

function cleanUpSVGs(folders) {
    console.log(`Cleaning up SVG icons files`);
    const versionReleasePath = path.join(paths.RELEASE_PATH, version);
    fs.mkdirSync(versionReleasePath);
    folders.forEach((styleFolder) => {
        cleanUpSVGsForStyle(styleFolder, versionReleasePath);
    });
}
function cleanUpSVGsForStyle(style, versionReleasePath) {
    console.log(`Cleaning up SVG icons files for style : ${style}`);
    const svgFiles = fs.readdirSync(path.join(paths.ICONS_PATH, style), { withFileTypes: true })
        .filter(dirent => !dirent.isDirectory() && path.extname(dirent.name).toLowerCase() === constants.EXTENSION)
        .map(dirent => dirent.name);

    const cleanedSvgDirPath = path.join(paths.ICONS_PATH, style, style);
    fs.mkdirSync(cleanedSvgDirPath);
    svgFiles.forEach((svgFileName) => {
        const svgFileNameWithoutExtension = svgFileName.split(constants.EXTENSION)[0];
        const svgFileNameWithSuffix = `${svgFileNameWithoutExtension}-${style.toLowerCase()}.svg`
        const svgFilePath = path.join(paths.ICONS_PATH, style, svgFileName);
        const cleanedSvgFilePath = path.join(cleanedSvgDirPath, svgFileNameWithSuffix);
        execSync(`sed -i '' -e "s/<g .*>/<g>/" "${svgFilePath}"`, { encoding: 'utf-8' });
        cleanUpSVG(svgFilePath, svgFilePath);
        execSync(`picosvg "${svgFilePath}"  > "${cleanedSvgFilePath}"`, { encoding: 'utf-8' });
        cleanUpSVG(cleanedSvgFilePath, cleanedSvgFilePath);
        console.log(`${chalk.inverse.green(" DONE ")} ${svgFileName} created.`);
    });
    const newPath = path.join(versionReleasePath, style);
    fs.renameSync(cleanedSvgDirPath, newPath);
}

function cleanUpSVG(svgFilePath, cleanedSvgFilePath) {
    const svgFile = fs.readFileSync(svgFilePath, { encoding: "utf-8" });
    const result = optimize(svgFile, {
        path: svgFilePath,
        multipass: true,
        plugins: [
            {
                name: 'preset-default',
                params: {
                    overrides: {
                        removeViewBox: false,
                    },
                },
            },
            {
                name: 'removeDimensions',
                params: {
                    removeDimensions: true,
                },
            },
        ]
    });
    const optimizedSvgString = result.data;
    createFile(optimizedSvgString, cleanedSvgFilePath);
}

function createFile(fileLines, svgFilePath) {
    try {
        fs.writeFileSync(svgFilePath, fileLines);
        // console.log(`${chalk.inverse.green(" DONE ")} ${svgFilePath} created.`);
    } catch (err) {
        console.error(
            `${chalk.inverse.red(" FAIL ")} Failed to create ${svgFilePath} file.`
        );
        console.group();
        console.error(err);
        console.groupEnd();
        return;
    }
}

cleanUp();

module.exports = { cleanUp }