/**
 * Возвращает правильное окончание для существительного в зависимости от аереданного числа
 * @param num number
 * @param {string} odin  Именительный падеж (1, 21 стол[""])
 * @param {string} dva   Родительный падеж ед.число (2, 33, 154 стол["а"])
 * @param {string} mnogo Родительный падеж мн.число (5, 11, 35 стол["ов"])
 * @returns {*}
 */
function digitEndingRU(num, odin, dva, mnogo) {
// несколько? "ов" один? ""  два? "а"
// несколько? "ей" один? "ь" два? "я"
    let o1, o2, ret, n=num.toString()
    if(n.length) {
        o1=n.substr(n.length-1)
        ret=mnogo;
        if(o1=="1") ret=odin
        if(o1>=2 && o1<=4) ret=dva
    }
    if(n.length>1) {
        o2=n.substr(n.length-2)
        if(o2>=11 && o2<=14) ret=mnogo
    }
    return ret
}

function unusedTest() {
    throw "I'm unused function. Find me!"
}

export default {digitEndingRU, unusedTest}