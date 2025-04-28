const text = document.getElementById('convert-text');
const title = document.getElementById('convert-title');

async function loadMapping(name) {
    try {
        const resp = await fetch(`mappings/${name}.json`);
        if (!resp.ok) throw new Error(`加载失败: ${name}.json`);
        return await resp.json();
    } catch (e) {
        alert(e.message);
        return {};
    }
}

// 正则转义
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function convertText(textarea, mapping) {
    let textVal = textarea.value;
    // 按 key 长度降序，避免短 key 影响长 key 替换
    const keys = Object.keys(mapping).sort((a, b) => b.length - a.length);
    for (const k of keys) {
        const v = mapping[k];
        textVal = textVal.replace(new RegExp(escapeRegExp(k), 'g'), v);
    }
    textarea.value = textVal;
}

async function handleConvert(type, font, ...mappingNames) {
    title.innerHTML = type;
    title.style.fontFamily = font;
    text.style.fontFamily = font;
    let mapping = {};
    for (const name of mappingNames) {
        const m = await loadMapping(name);
        mapping = Object.assign(mapping, m);
    }
    convertText(text, mapping);
}

document.getElementById('yijian').addEventListener('click', () => {
    handleConvert(
        '二简转换器',
        'Iosevka, Menlo, Monaco, Consolas, "Courier New", SimSun, serif',
        'yijian'
    );
});

document.getElementById('erjian-1').addEventListener('click', () => {
    handleConvert(
        '二简转换𫩏',
        'Iosevka, Menlo, Monaco, Consolas, "Courier New", erjian1, SimSun, serif',
        'erjian1'
    );
});

document.getElementById('erjian-2').addEventListener('click', () => {
    handleConvert(
        '二𫈉转换𫩏',
        'Iosevka, Menlo, Monaco, Consolas, "Courier New", erjian2, SimSun, serif',
        'erjian1', 'erjian2'
    );
});

document.getElementById('erjian-xiu').addEventListener('click', () => {
    handleConvert(
        '二𫈉转换器',
        'Iosevka, Menlo, Monaco, Consolas, "Courier New", erjianx, SimSun, serif',
        'erjianXiu'
    );
});
