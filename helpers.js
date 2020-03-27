const cheerio = require('cheerio');
const moment = require('moment');

Object.flatten = function (data) {
    var result = {};
    function recurse(cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            for (var i = 0, l = cur.length; i < l; i++)
                recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop + "." + p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
}

let defaultData = {
    aus: { new: 0, total: 0, states: { act: 0, nsw: 0, nt: 0, qld: 0, sa: 0, t: 0, v: 0, wa: 0 } },
    international: { total: 0, deaths: 0 }
};
function extractHealthData(html) {
    const $ = cheerio.load(html);
    let data = extractGeneralInfo($);
    data.aus.states = extractStateData($);
    return Object.flatten(data);
}

const extractGeneralInfo = ($) => {
    let data = defaultData;
    let rowData = $('.au-callout');
    rowData = rowData.slice(0, rowData.length);
    Object.values(rowData).map((item, index) => {
        const { children } = item;
        if (!children || children.length - 1 === 0) return
        let info = [];
        children.forEach(e => {
            if (!e.data) {
                info.push(e.children[0].data);
            } else {
                info.push(e.data);
            }
        });
        switch (index) {
            case 0:
                //aus
                const t = Number.parseInt(info[1].split(' ')[0].replace(/\D/g, ''));
                const n = Number.parseInt(info[2].split(' ')[6].replace(/\D/g, ''));
                data.aus.total = t;
                data.aus.new = n;
                break;
            case 1:
                //global
                data.international.total = Number.parseInt(info[1].split(' ')[0].replace(/\D/g, ''));
                data.international.deaths = Number.parseInt(info[3].split(' ')[0].replace(/\D/g, ''));
                break;
            default:
                break;
        }
    })
    return data;
}

const stateMap = {
    act: 'Australian Capital Territory',
    nsw: 'New South Wales',
    nt: 'Northern Territory', qld: 'Queensland',
    sa: 'South Australia', t: 'Tasmania', v: 'Victoria', wa: 'Western Australia'
}
const extractStateData = ($) => {
    let states = defaultData.aus.states;
    const sel = '.health-table__responsive tbody';
    let rowData = $(sel)
    rowData = rowData.slice(0, rowData.length)[0].children;


    //this site is a shithole and i hate it.
    rowData.map((r, i) => {
        Object.keys(r, i, ((i % 2) > 0));
        if (((i % 2) > 0)) {
            let extract = { place: '', data: 0 };
            r.children.forEach(x => {
                if (x.children) {
                    x.children.forEach((d, index) => {
                        if (d.data) {
                            const number = Number.parseInt(d.data);
                            if (!isNaN(number)) {
                                extract.data = Number.parseInt(d.data);
                            }
                        } else {
                            if (d.children[0].data) {
                                const number = Number.parseInt(d.children[0].data);
                                if (isNaN(number) && d.children[0].data !== '') {
                                    extract.place = d.children[0].data;
                                } else {
                                    extract.data = number;
                                }
                            }

                        }
                    });
                }
            });
            if (extract.place != '') states[getStateKey(extract.place)] = extract.data;
        } else {
            // value r.data is ignorable -> \n 
        }
    });

    return states;
}

const getStateKey = (name) => {
    let key = '';
    const formatName = name.toUpperCase();
    Object.keys(stateMap).forEach(k => {
        const full = stateMap[k].toUpperCase();
        if (formatName == full) key = k;
    });
    return key;
}

module.exports = {
    extractHealthData
};