/**
 * ���������� ���������� ��������� ��� ���������������� � ����������� �� ����������� �����
 * @param num number
 * @param {string} odin  ������������ ����� (1, 21 ����[""])
 * @param {string} dva   ����������� ����� ��.����� (2, 33, 154 ����["�"])
 * @param {string} mnogo ����������� ����� ��.����� (5, 11, 35 ����["��"])
 * @returns {*}
 */
function digitEndingRU(num, odin, dva, mnogo) {
// ���������? "��" ����? ""  ���? "�"
// ���������? "��" ����? "�" ���? "�"
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