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

// Modified convertText: takes input string, returns converted string
function convertText(inputText, mapping) {
    let textVal = inputText;
    // 按 key 长度降序，避免短 key 影响长 key 替换
    const keys = Object.keys(mapping).sort((a, b) => b.length - a.length);
    for (const k of keys) {
        const v = mapping[k];
        // Ensure v is a string; handle potential non-string values if necessary
        const replacement = (typeof v === 'string') ? v : String(v);
        try {
            textVal = textVal.replace(new RegExp(escapeRegExp(k), 'g'), replacement);
        } catch (e) {
            console.error(`Error replacing key: ${k}`, e);
            // Optionally skip this key or handle the error differently
        }
    }
    return textVal; // Return the converted string
}

async function handleConvert(type, font, ...mappingNames) {
    text.style.fontFamily = font;
    title.textContent = type;

    const currentText = text.value;
    let textToConvert = currentText;

    // If the target is an Erjian version (not 'yijian'),
    // first convert the current text back to Yijian.
    if (mappingNames.length > 0 && mappingNames[0] !== 'yijian') {
        try {
            const yijianMapping = await loadMapping('yijian');
            // Use the modified convertText, passing the current string
            textToConvert = convertText(currentText, yijianMapping);
            // console.log("Intermediate Yijian:", textToConvert); // Optional: for debugging
            if (typeof textToConvert !== 'string') {
                 throw new Error("Intermediate conversion did not return a string.");
            }
        } catch (error) {
            console.error("Error loading or applying yijian mapping:", error);
            text.value = `Error during intermediate conversion to Yijian: ${error.message}`;
            return; // Stop if intermediate conversion fails
        }
    }

    // Now, load the target mapping(s) and convert the (potentially intermediate) text.
    try {
        const mappings = await Promise.all(mappingNames.map(loadMapping));
        const combinedMapping = mappings.reduce((acc, map) => ({ ...acc, ...map }), {});
        // Use the modified convertText, passing the intermediate string, and assign result to textarea
        text.value = convertText(textToConvert, combinedMapping);
    } catch (error) {
        console.error("Error loading or applying target mapping:", error);
        text.value = `Error during final conversion: ${error.message}`;
    }
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
        '二简转换𫩏 (草案一表)', // Update title for clarity
        'Iosevka, Menlo, Monaco, Consolas, "Courier New", erjian1, SimSun, serif',
        'erjian1'
    );
});

document.getElementById('erjian-2').addEventListener('click', () => {
    handleConvert(
        '二𫈉转换𫩏 (草案两表)', // Update title for clarity
        'Iosevka, Menlo, Monaco, Consolas, "Courier New", erjian2, SimSun, serif',
        'erjian1', 'erjian2' // Keep both mappings as Table 2 includes Table 1 implicitly in its design usually, but explicit ensures coverage
    );
});

document.getElementById('erjian-xiu').addEventListener('click', () => {
    handleConvert(
        '二𫈉转换器 (修订草案)', // Update title for clarity
        'Iosevka, Menlo, Monaco, Consolas, "Courier New", erjianx, SimSun, serif',
        'erjianXiu'
    );
});
