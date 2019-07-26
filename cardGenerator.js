class CardGenerator {

    constructor(template) {
        this.templateJson = template;
        this.keys = [];
        this.getKeys(template);
    }

    fetchKeys() {
        return(this.keys);
    }

    getKeys(obj, path = "") {
        var items;
        if(obj.type === 'AdaptiveCard') {
            items = obj.body;
            path +="body";
        } else if (obj.type === 'Container' || obj.type === 'Column') {
            items = obj.items;
            path +="items";
        } else if (obj.type === 'ColumnSet') {
            items = obj.columns;
            path +="columns";
        } else if (obj.type === 'ImageSet') {
            items = obj.images;
            path +="images";
        }
        if(items && Array.isArray(items)) {
            for (var index in items) {
                var new_path = path + "/" + index + "/";
                var item = items[index];
                if(item.id) {
                    let entry = {};
                    entry.id = item.id;
                    entry.type = item.type;
                    entry.path = new_path;
                    if (item.pattern)
                        entry.pattern = item.pattern;
                    entry.dataPath = item.dataPath;
                    this.keys.push(entry);
                }
                this.getKeys(item, new_path);
            }
        } 
    }

    populate(data) {
        var clonedTemplate = JSON.parse(JSON.stringify(this.templateJson));
        for (var i = 0; i < this.keys.length; i++) {
            this.setValue(clonedTemplate, this.keys[i].path, data[this.keys[i].id], this.keys[i].id);
        }
        return clonedTemplate;
    }

    bindDataSchema(keys) {
        var clonedTemplate = JSON.parse(JSON.stringify(this.templateJson));
        for (var i = 0; i < keys.length; i++) {
            this.setDataPath(clonedTemplate, keys[i].path, keys[i].dataPath, keys[i].id);
        }
        return clonedTemplate;
    }

    setDataPath(obj, path, dataPath, id) {
        var crumbs = path.split("/");
        for (var i = 0; i < crumbs.length; i++) {
            var key = crumbs[i];
            if(key) {
                obj = obj[key];
            }
        }
        if(obj.id === id) {
            switch (obj.type){
                case "TextBlock":
                    obj.text = dataPath;
                    break;
                case "Image":
                    obj.url = dataPath;
                    break;
                default:
                    obj.value = dataPath;
                    break;
            }
        }
    }

    setValue(obj, path, value, id) {
        var crumbs = path.split("/");
        for (var i = 0; i < crumbs.length; i++) {
            var key = crumbs[i];
            if(key) {
                obj = obj[key];
            }
        }
        if(obj.id === id) {
            switch (obj.type){
                case "TextBlock":
                    obj.text = value;
                    break;
                case "Image":
                    obj.url = value;
                    break;
                default:
                    obj.value = value;
                    break;
            }
        }
    }

    getCard(data) {
        var clonedTemplate = JSON.parse(JSON.stringify(this.templateJson));
        var clonedData = JSON.parse(JSON.stringify(data));
        for (var i = 0; i < this.keys.length; i++) {
            var key = this.keys[i];
            var pathObject = this.resolvePath(clonedTemplate, key.path);
            var value = this.resolvePath(clonedData, key.dataPath);
            if(pathObject.id === key.id) {
                switch (pathObject.type){
                    case "TextBlock":
                        pathObject.text = value;
                        break;
                    case "Image":
                        pathObject.url = value;
                        break;
                    default:
                        pathObject.value = value;
                        break;
                }
            }
        }
        return clonedTemplate;
    }

    resolvePath(obj, path) {
        var crumbs = path.split("/");
        for (var i = 0; i < crumbs.length; i++) {
            var key = crumbs[i];
            if(key) {
                obj = obj[key];
            }
        }
        return obj;
    }
}

module.exports = CardGenerator;