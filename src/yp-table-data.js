/** @typedef {Array<Object<string,number>>} */
let fieldOrders;

/** @typedef {{
	fields: fieldOrders,
	rowData: Array<Array>
}} */
let dryTableData;

/**
 * [ypTableData description]
 * @param  {dryTableData} data 
 * @constructor
 */
function ypTableData(data) {
	this.fields = data.fields
	this.fieldsCache = _makeFieldsCache(data.fields)
	this.rowData = data.rowData
	this.length = data.rowData.length
}
	function _makeFieldsCache(fields) {
		var ret = {}, i, iL=fields.length
		for(i=0; i<iL; i++) ret[getProp1(fields[i])] = {fieldIndex: i}
		return ret
	}

	let ypTableData_proto = ypTableData.prototype

	
	ypTableData_proto.getRow = /** Gets ypTableRow instance by row index
	 * @param  {number} rowIndex
	 * @this {ypTableData}
	 * @return {ypTableRow}
	 */function(rowIndex) {
		var tbl=this, aRow=tbl.rowData[rowIndex]
		if(!aRow) throw `Row not found (rowIndex=${rowIndex})`
		return _addRowAPI(aRow, tbl)
	}
		function _addRowAPI(aRow, tbl) {
			if(!aRow.api) aRow.api = new ypTableRow(aRow, tbl)
			return aRow.api
		}

	
	ypTableData_proto.forEachRow = /** Iterate callback (cb) by all rows, stops if cb returns false
	 * @this {ypTableData}
	 * @param  {function(ypTableRow, number):(undefined|boolean)} cb If returns false then cycle stops
	 * @return {ypTableData}
	 */function(cb) {
		var tbl=this, i, rd=tbl.rowData
		for(i=0; i<rd.length; i++) {
			if(cb.call(this, _addRowAPI(rd[i], tbl), i) === false) break
		}
		return this
	}

	
	ypTableData_proto.sortBy = /**
	 * Sorts dataset
	 * @param  {Array<Object<string,number|Object>>} fields order with options
	 * @this {ypTableData}
	 * @return {ypTableData}
	 */function(fields) {
		var flds = [], t, ypTable=this, fieldOpts={}, i, iL, o, fld

		for(i=0, iL=fields.length; i<iL; i++) {
			o = fields[i]; flds[i] = getProp1(o)
			for(fld in o) if('object'== typeof o[fld]) fieldOpts[fld] = o[fld]
		}

		if((t=ypTable.rowData).length) t.sort(function(a, b) {
			return _tableSorter.call({lev:0, ypTable, fieldOpts, flds}, a, b)
		})
		return ypTable
	}
		function _tableSorter(row1, row2) {
			var ctx=this, // {lev:0..n, ypTable, fieldOpts, flds}
				fld = ctx.flds[ctx.lev], t, ret=0,
				fi= ctx.ypTable.fieldsCache[fld].fieldIndex, // индекс поля fld в rowData
				v1 = row1[fi], v2 = row2[fi], 
				fo = ctx.fieldOpts[fld] || {}
				
			if(t=fo.dataFilter) {v1 = t(v1); v2 = t(v2)}

			if(v1 < v2) ret = fo.desc ? 1 : -1
			else if(v1 > v2) ret = fo.desc ? -1 : 1
			else if(ctx.lev + 1 < ctx.flds.length) {ctx.lev++; ret=_tableSorter.call(ctx, row1, row2)}
			
			return ret
		}

	/**
	 * @param  {Array<Object<string,?>>} fields
	 * @this {ypTableData}
	 * @return {Object}
	 */
	ypTableData_proto.groupBy = function(fields) {
		var tbl=this, i, j, jL, rd=tbl.rowData, fc=tbl.fieldsCache, el, hash={}, fld, fo, t, val, key, curHash,
			k, fld2, fo2, val2, key2

		for(i=0; i<fields.length; i++) {
			// цикл по полям группировки
			// в первой итерации заполняются группы первого уровня в hash = {key:{groupValue:..., childGroups}}
			
			// во второй итерации нужно получить ключи 1-й итерации для каждой строки
			// заменить текущий хеш на элемент хеша верхнего уровня
			 
			// получим текущее поле группировки fld и объект опций fo
			for(fld in fields[i]) fo=fields[i][fld] // получили поле и опции
			if('object' != typeof fo) fo={}

			for(j=0, jL=rd.length; j<jL; j++) {
				// цикл по всем строкам
				curHash=hash

				if(i>0) {
					// на уровне > 0 нужно создать дерево на нужной ветке hash
					// и установить новый указатель на curHash
					for(k=0; k<i; k++) {
						for(fld2 in fields[k]) fo2=fields[k][fld2]
						val2 = rd[j][fc[fld2].fieldIndex]
						key2 = ((t=fo2.dataFilter) ? t(val2) : val2) || ''
						if(!curHash[key2].childGroups) curHash[key2].childGroups = {}
						curHash = curHash[key2].childGroups
					}
				}

				val = rd[j][fc[fld].fieldIndex]
				key = ((t=fo.dataFilter) ? t(val) : val) || ''

				// создаем хэш на первом уровне
				if(!curHash[key]) curHash[key] = {groupValue: val}
			}
		}
		return hash
	}


/**
 * [ypTableRow description]
 * @constructor
 * @param  {Array} rd  Array of row values
 * @param  {ypTableData} tbl Link to DataSet
 */
function ypTableRow(rd, tbl) {
	this.aRow = rd
	this.ypTable = tbl
}
	let ypTableRow_proto = ypTableRow.prototype


	
	ypTableRow_proto.get = /** Gets field value by name in 1-st key name of fld
	 * @param  {Object} fld
	 * @this {ypTableRow}
	 * @return {?}
	 */function(fld) {
		var field = getProp1(fld), tbl=this.ypTable, fi=tbl.fieldsCache[field].fieldIndex
		return this.aRow[fi]
	}

	
	ypTableRow_proto.getValues = /** Gets object with field names and its values
	 * @this {ypTableRow}
	 * @return {Object}
	 */function() {
		var fds=this.ypTable.fieldsCache, fld, ret={}
		for(fld in fds) {
			ret[fld] = this.aRow[fds[fld].fieldIndex]
		}
		return ret
	}

	
	ypTableRow_proto.setValues = /** Sets new data for row from object of field names and its values
	 * @this {ypTableRow}
	 * @param {Object} data
	 * @return {ypTableRow}
	 */function(data) {
		var fds=this.ypTable.fieldsCache, fld
		for(fld in data) {
			this.aRow[fds[fld].fieldIndex] = data[fld]
		}
		return this
	}

// Utilities
function getProp1(p) {var i; for(i in p) return i}

export default ypTableData