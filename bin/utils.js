function clearAndUpper(text) {
    return text.replace(/-/, "").toUpperCase();
}

function toPascalCase(text) {
    return text.replace(/(^\w|-\w)/g, clearAndUpper);
}

function toCamelCase(text) {
    return lowerFirstLetter(toPascalCase(text));
}

function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function lowerFirstLetter(word) {
    return word.charAt(0).toLowerCase() + word.slice(1);
}

module.exports = { toPascalCase, toCamelCase, capitalizeFirstLetter };