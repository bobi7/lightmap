/** ****************************************************************************************************
 * File: LightMap.js
 * Project: lightmap
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 31-May-2018
 *******************************************************************************************************/
'use strict';

const { version } = require( './package' );

/**
 * LightMap
 * @augments Map
 */
class LightMap extends Map
{
	constructor( n )
	{
		super( n );

		this.forEach(
			( v, k ) => this.set( k, this[ Symbol.constructMapByPattern ]( v ) )
		);
	}

	/**
	 * filter
	 * @description
	 * Filter LightMap based on keys and values based in.
	 * Comparisons can be made on the key and/or value.
	 * @param {Function} fn - comparing method
	 * @return {LightMap} - returns new LightMap with filtered results
	 * @example
	 * const _ = new LightMap();
	 * _.set( 'key', 'value' );
	 * _.set( 'key1', 'value1' );
	 *
	 * const result = _.filter(
	 *     ( v, k ) => k === 'key'
	 * );
	 *
	 * // -> LightMap { 'key' => 'value' }
	 */
	filter( fn )
	{
		const arr = new LightMap();

		for( const [ key, value ] of this[ Symbol.iterator ]() ) {
			if( fn( value, key, this ) ) {
				arr.set( key, value );
			}
		}

		return arr;
	}

	/**
	 * map
	 * @description
	 * Map LightMap with new key and/or value.
	 * Return the new item in a "tuple" form matching the Map paradigm (`[ x, y ]`).
	 * @param {Function} fn - map method
	 * @return {LightMap} - returns new LightMap with mapped results
	 * @example
	 * const _ = new LightMap();
	 * _.set( 'key', 'value' );
	 *
	 * const result = _.map(
	 *     ( v, k ) => [ k + 1, v + 1 ]
	 * );
	 *
	 * // -> LightMap { 'key1' => 'value1' }
	 */
	map( fn )
	{
		const arr = new LightMap();

		for( const [ key, value ] of this[ Symbol.iterator ]() ) {
			let entry = fn( value, key, this );

			if( !entry ) {
				entry = [ undefined, undefined ];
			}

			arr.set( entry[ 0 ] || key, entry[ 1 ] || value );
		}

		return arr;
	}

	/**
	 * reduce
	 * @description
	 * Reduce LightMap with new value.
	 * Must return the carriage value just like Array.reduce.
	 * @param {Function} fn - reducing method
	 * @param {*} r - carriage value
	 * @param {Iterator<LightMap>} iterator - `LightMap[ Symbol.iterator ]()`
	 * @return {*} - returns reduced result
	 * @example
	 * const _ = new LightMap();
	 * _.set( 'key', 'value' );
	 *
	 * const result = _.reduce(
	 *     ( r, [ k, v ] ) => {
	 *         r += `Key: ${ k }\n`;
	 *         r += `Value: ${ v }\n`;
	 *         return r;
	 *     }, ''
	 * );
	 *
	 * // -> 'Key: key\nValue: value\n'
	 */
	reduce( fn, r, iterator = this[ Symbol.iterator ]() )
	{
		for( const [ key, value ] of iterator ) {
			r = fn( r, [ key, value ], key, this );
		}

		return r;
	}

	/**
	 * map
	 * @description
	 * Map LightMap with new key and/or value.
	 * Return the new item in a "tuple" form matching the Map paradigm (`[ x, y ]`).
	 * @param {Function?} fn - map method
	 * @return {LightMap} - returns new LightMap with mapped results
	 * @example
	 * const _ = new LightMap();
	 * _.set( 'key2', 'value2' );
	 * _.set( 'key1', 'value1' );
	 * _.set( 'key', 'value' );
	 *
	 * const result = _.sortKeys();
	 *
	 * // -> LightMap { 'key' => 'value', 'key1' => 'value1', 'key2' => 'value2' }
	 */
	sortKeys( fn )
	{
		const keys = [ ...this.keys() ].sort( fn );
		let i      = 0;

		return this.map(
			( v, k, iterator ) => {
				const key = keys[ i++ ];
				return [ key, iterator.get( key ) ];
			}
		);
	}

	// TODO::: [sortValues] get back to this
	// sortValues( fn )
	// {
	// 	const
	// 		iterator = this[ Symbol.iterator ](),
	// 		arr      = [];
	//
	// 	let
	// 		done    = false,
	// 		current = null,
	// 		next    = null;
	//
	// 	while( !done ) {
	// 		if( !current ) {
	// 			current = iterator.next();
	// 		}
	//
	// 		next = iterator.next();
	// 		done = next.done;
	//
	// 		if( done ) {
	// 			return;
	// 		}
	//
	// 		const x = fn.call( arr, current.value[ 1 ], next.value[ 1 ] );
	//
	// 		console.log( x );
	// 		current = next;
	// 	}
	//
	// 	return arr;
	// }

	/**
	 * version
	 * @description
	 * return LightMap module version
	 * @return {string} - returns LightMap module version
	 * @example
	 * LightMap.version();
	 *
	 * // -> v0.0.0
	 */
	static version()
	{
		return `v${ version }`;
	}

	/**
	 * mapToArray
	 * @description
	 * maps a LightMap object to an array of arrays in the Map Pattern (re-constructable pattern)
	 * @return {Array} - returns array of tuple key-value pairs
	 * @example
	 *
	 * const _ = new LightMap();
	 * _.set( 'key', new LightMap( [ [ 'key1', 'value1' ] ] ) );
	 *
	 * const result = _.mapToArray();
	 *
	 * // -> [ [ 'key', [ [ 'key1', 'value1' ] ] ] ]
	 */
	mapToArray()
	{
		return this.reduce(
			( r, [ k, v ] ) => {
				if( v instanceof LightMap ) {
					v = v.toJSON();
				}

				r.push( [ k, v ] );
				return r;
			}, []
		);
	}

	toJSON()
	{
		return this.mapToArray();
	}

	toString()
	{
		return JSON.stringify( this.mapToArray() );
	}

	indexOf( n )
	{
		let i = -1;

		return this.reduce(
			( r, [ k ] ) => {
				if( r === -1 ) {
					i++;

					if( k === n ) {
						r = i;
					}
				}

				return r;
			}, -1
		);
	}

	// TODO::: [equals] get back to this
	// equals( n )
	// {
	// 	if( n instanceof LightMap ) {
	// 		if( this.size !== n ) {
	// 			return false;
	// 		}
	// 	}
	// 	return false;
	// }

	[ Symbol.constructMapByPattern ]( n )
	{
		return Array.isArray( n ) ?
			n.filter( i => i.length === 2 ).length === n.length ?
				Reflect.construct( LightMap, [ n ] ) :
				n : n;
	}

	[ Symbol.search ]( n )
	{
		return this.indexOf( n );
	}

	[ Symbol.replace ]( n )
	{
		return this.reduce(
			( r, [ k, v ] ) => {
				r = r.replace( k, v );
				return r;
			}, n
		);
	}

	[ Symbol.toPrimitive ]( n )
	{
		if( n === 'string' ) {
			return this.toString();
		} else if( n === 'number' ) {
			return +this.size;
		} else if( n === 'boolean' ) {
			return !!this;
		} else {
			return this.toString();
		}
	}

	get [ Symbol.toStringTag ]()
	{
		return this.constructor.name;
	}

	static get [ Symbol.species ]()
	{
		return Map;
	}

	static [ Symbol.hasInstance ]( instance )
	{
		return instance.constructor.name === 'LightMap';
	}
}

module.exports = LightMap;
