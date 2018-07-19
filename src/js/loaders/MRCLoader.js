import * as THREE from 'three';

MRCLoader = function (manager) {

	this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;

};

Object.assign(MRCLoader.prototype, THREE.EventDispatcher.prototype, {

	load: function (url, onLoad, onProgress, onError) {
		var scope = this;

		var loader = new THREE.FileLoader(scope.manager);
		loader.setResponseType('arraybuffer');
		loader.load(url, function (data) {

			onLoad(scope.parse(data));

		}, onProgress, onError);

	},

	parse: function (data) {
		
		var _data = data;
		var _dataPointer = 0;
		var _nativeLittleEndian = new Int8Array(new Int16Array([1]).buffer)[0] > 0;
		var _littleEndian = true;

		function parseStream(_data) {

			var MRC = {
				nx: 0, //Number of Columns
				ny: 0, //Number of Rows
				nz: 0, //Number of Sections
				mode: 0, //Type of pixel in image. Values used by IMOD
				nxstart: 0, //Startin poin to sub image (not used in IMOD)
				nystart: 0,
				nzstart: 0,
				mx: 0, //Grid size in X, Y, Z
				my: 0,
				mz: 0,
				xlen: 0, //Cell size; pixel spacing = xlen/mx...
				ylen: 0,
				zlen: 0,
				alpha: 0, //cell angles - ignored by IMOD
				beta: 0,
				gamma: 0,
				mapc: 0, //map column
				mapr: 0, //map row
				maps: 0, //map section
				amin: 0, //Minimum pixel value
				amax: 0, //Maximum pixel value
				amean: 0, //mean pixel value
				ispg: 0, //space group numbe (ignored by IMOD0
				next: 0, //number of bytes in extended header
				creatid: 0, //is 0
				extra: null,
				nint: 0, // number of intergers or bytes per section
				nreal: 0, // Number of reals per section
				extra: null,
				imodStamp: 0, //1146047817 = file created by IMOD
				imodFlags: 0, //Bit flags
				idtype: 0,
				lens: 0,
				nd1: 0,
				nd2: 0,
				vd1: 0,
				vd2: 0,
				tiltangles: null,
				xorg: 0, //Orgin of the image
				yorg: 0,
				zorg: 0,
				cmap: 0, //Contains "MAP "
				stamp: 0, //Frist two bytes = 17 17 for bin-endian or 68 and 65 for littl-edian
				rms: 0, //RMS deviation of densitites from mean density
				nlabl: 0, //number of lables with useful data
				data: null, //10 lables of 80 characters
				min: Infinity,
				max: -Infinity,
				mean: 0,
				space: null,
				spaceorientation: null,
				rasspaceorientation: null,
				orientation: null,
				normcosine: null
			};

			_dataPointer = 0;		
			
			// Reading the data. Names are the names used in C code.
			MRC.nx = scan('sint'); console.log('nx = ' + MRC.nx);
			MRC.ny = scan('sint'); console.log('ny = ' + MRC.ny);
			MRC.nz = scan('sint'); console.log('nz = ' + MRC.nz);
			MRC.mode = scan('sint');

			_dataPointer = 28;

			MRC.mx = scan('sint'); console.log('mx = ' + MRC.mx);
			MRC.my = scan('sint'); console.log('my = ' + MRC.my);
			MRC.mz = scan('sint'); console.log('mz = ' + MRC.mz);

			// pixel spacing = xlem/mx
			MRC.xlen = scan('float'); console.log('xlen = ' + MRC.xlen);
			MRC.ylen = scan('float'); console.log('ylen = ' + MRC.ylen);
			MRC.zlen = scan('float'); console.log('zlen = ' + MRC.zlen);
			MRC.alpha = scan('float');
			MRC.beta = scan('float');
			MRC.gamma = scan('float');
			MRC.mapc = scan('sint');
			MRC.mapr = scan('sint');
			MRC.maps = scan('sint');
			MRC.amin = scan('float');
			MRC.amax = scan('float');
			MRC.amean = scan('float');
			MRC.ispeg = scan('sint');
			MRC.next = scan('sint');
			MRC.creatid = scan('short');

			//Not sure what to do with the extra data, says 30 for size
			MRC.nint = scan('short');
			MRC.nreal = scan('short');
			//Need to figure out extra data, 20 for size
			MRC.imodStamp = scan('sint');
			MRC.imodFLags = scan('sint');
			MRC.idtype = scan('short');
			MRC.lens = scan('short');
			MRC.nd1 = scan('short');
			MRC.nd2 = scan('short');
			MRC.vd1 = scan('short');
			MRC.vd2 = scan('short');

			// loop this around (6 different ones)
			MRC.tiltangles = scan('float', 6);

			_dataPointer = 196;

			MRC.xorg = scan('float');
			MRC.yorg = scan('float');
			MRC.zorg = scan('float');

			_dataPointer = 216;

			MRC.rms = scan('float');
			MRC.nlabl = scan('sint');

			// 10 of 80 characters
			MRC.lables = scan('schar', 10);

			// size of the image
			var volsize = MRC.nx * MRC.ny * MRC.nz;

			//Dealing with extended header
			//****************After the header you have all the data***********************************************//
			
			if (MRC.next != 0) {
				_dataPointer = MRC.next + 1024;
				
				switch (MRC.mode) {
				case 0:
					MRC.data = scan('schar', volsize);
					break;
				case 1:
					MRC.data = scan('sshort', volsize);
					break;
				case 2:
					MRC.data = scan('float', volsize);
					break;
				case 3:
					MRC.data = scan('uint', volsize);
					break;
				case 4:
					MRC.data = scan('double', volsize);
					break;
				case 6:
					MRC.data = scan('ushort', volsize);
					break;
				case 16:
					MRC.data = scan('uchar', volsize);
					break;

				default:
					throw new Error('Unsupported MRC data type: ' + MRC.mode);
				};
			}
			//****************After the header you have all the data***********************************************//

			// Read for the type of pixels --> Basically the mrc voxel data
			_dataPointer = 1024;
			
			console.log('MRC mode=' + MRC.mode);
			console.log('Total elements=' + volsize);
			
			switch (MRC.mode) {
			case 0:
				MRC.data = scan('schar', volsize);
				break;
			case 1:
				MRC.data = scan('sshort', volsize);
				break;
			case 2:
				MRC.data = scan('float', volsize);
				break;
			case 3:
				MRC.data = scan('uint', volsize);
				break;
			case 4:
				MRC.data = scan('double', volsize);
				break;
			case 6:
				MRC.data = scan('ushort', volsize);
				break;
			case 16:
				MRC.data = scan('uchar', volsize);
				break;

			default:
				throw new Error('Unsupported MRC data type: ' + MRC.mode);
			}

			// minimum, maximum, mean intensities
			// centered on the mean for best viewing ability
			if (MRC.amean - (MRC.amax - MRC.amean) < 0) {
				MRC.min = MRC.amin;
				MRC.max = MRC.amean + (MRC.amean - MRC.amin);
			} else {
				MRC.min = MRC.amean - (MRC.amax - MRC.amean);
				MRC.max = MRC.amax
			}

			return MRC;

		};

		function scan (type, chunks) {

			if (chunks === null || chunks === undefined) {

				chunks = 1;

			}

			var _chunkSize = 1;
			var _array_type = Uint8Array;

			switch (type) {

				// 1 byte data types
			case 'uchar':
				break;
			case 'schar':
				_array_type = Int8Array;
				break;
				// 2 byte data types
			case 'ushort':
				_array_type = Uint16Array;
				_chunkSize = 2;
				break;
			case 'sshort':
				_array_type = Int16Array;
				_chunkSize = 2;
				break;
				// 4 byte data types
			case 'uint':
				_array_type = Uint32Array;
				_chunkSize = 4;
				break;
			case 'sint':
				_array_type = Int32Array;
				_chunkSize = 4;
				break;
			case 'float':
				_array_type = Float32Array;
				_chunkSize = 4;
				break;
			case 'complex':
				_array_type = Float64Array;
				_chunkSize = 8;
				break;
			case 'double':
				_array_type = Float64Array;
				_chunkSize = 8;
				break;

			}
			
			var _start = _dataPointer;
			var _end = _dataPointer += chunks * _chunkSize;
			
			console.log(_start + ',' + _end);
			
			var _data_slice = _data.slice(_start, _end);
			var voxels = new _array_type(_data_slice);

			if (_nativeLittleEndian != _littleEndian) {
				voxels = flipEndianness(voxels, _chunkSize);
			}

			if (chunks == 1) {
				return voxels[0];
			}

			return voxels;

		};

		//Swapping the bits to match the endianness
		 function flipEndianness(array, chunkSize) {

			var u8 = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
			for (var i = 0; i < array.byteLength; i += chunkSize) {

				for (var j = i + chunkSize - 1, k = i; j > k; j--, k++) {

					var tmp = u8[k];
					u8[k] = u8[j];
					u8[j] = tmp;

				}

			}
			return array;
		};

		var MRC = parseStream(data);

		var volume = new THREE.Volume();

		// min and max intensities
		var min = MRC.min;
		var max = MRC.max;

		// attach the scalar range to the volume
		volume.windowLow = min;
		volume.windowHigh = max;

		//get dimsensions
		
		volume.xLength = MRC.nx;
		volume.yLength = MRC.ny;
		volume.zLength = MRC.nz;

		var _dimensions = [MRC.nx, MRC.ny, MRC.nz]; //voxel(i,j,k)
		volume.dimensions = _dimensions;

		//get voxel spacing
		var spacingX = MRC.xlen / MRC.mx;
		var spacingY = MRC.ylen / MRC.my;
		var spacingZ = MRC.zlen / MRC.mz;
		//volume.spacing = [spacingX, spacingY, spacingZ];
		volume.spacing = [1, 1, 1];

		// set the default threshold
		if (volume.lowerThreshold ===  - Infinity) {
			volume.lowerThreshold = min;
		}
		if (volume.upperThreshold === Infinity) {
			volume.upperThreshold = max;
		}

		//store the data into the volume
		_data = MRC.data;
		console.log('Data at last point' + _data[2686975]);

		volume.data = _data;

		// Create IJKtoRAS matrix
		volume.matrix = new THREE.Matrix4();

		//(Set these value as transpose of required matrix--three.js thing)
		volume.matrix.set(-1, 0, 0, 0,
			0, 0, -1, 0,
			0, -1, 0, 0,
			MRC.nx, MRC.ny, MRC.nz, 1);

		// Invert IJKtoRAS matrix
		volume.inverseMatrix = new THREE.Matrix4();
		volume.inverseMatrix.getInverse(volume.matrix);

		//Get RAS Dimensions
		volume.RASDimensions = (new THREE.Vector3(volume.xLength, volume.yLength, volume.zLength)).applyMatrix4(volume.matrix).round().toArray().map(Math.abs);

		/*
		// Transform ijk (0, 0, 0) to RAS
		var tar = goog.vec.Vec4.createFloat32FromValues(0, 0, 0, 1);
		var res = goog.vec.Vec4.createFloat32();
		goog.vec.Mat4.multVec4(IJKToRAS, tar, res);

		// Transform ijk (spacingX, spacinY, spacingZ) to RAS
		var tar2 = goog.vec.Vec4.createFloat32FromValues(1, 1, 1, 1);
		var res2 = goog.vec.Vec4.createFloat32();
		goog.vec.Mat4.multVec4(IJKToRAS, tar2, res2);

		// grab the RAS dimensions
		MRI.RASSpacing = [res2[0] - res[0], res2[1] - res[1], res2[2] - res[2]];
		MRI.RASDimensions = [_rasBB[1] + _rasBB[0] + 1, _rasBB[3] - _rasBB[2] + 1, _rasBB[5] - _rasBB[4] + 1];

		// grab the RAS Origin
		MRI.RASOrigin = [_rasBB[0], _rasBB[2], _rasBB[4]];
		 */
		return volume;

	} //end of parse

} //end of block of {load(),parse()}
); //end of Object.assign


/**
 * This class had been written to handle the output of the NRRD loader.
 * It contains a volume of data and informations about it.
 * For now it only handles 3 dimensional data.
 * See the webgl_loader_nrrd.html example and the loaderNRRD.js file to see how to use this class.
 * @class
 * @author Valentin Demeusy / https://github.com/stity
 * @param   {number}        xLength         Width of the volume
 * @param   {number}        yLength         Length of the volume
 * @param   {number}        zLength         Depth of the volume
 * @param   {string}        type            The type of data (uint8, uint16, ...)
 * @param   {ArrayBuffer}   arrayBuffer     The buffer with volume data
 */
module.exports = THREE.Volume = function( xLength, yLength, zLength, type, arrayBuffer ) {

	if ( arguments.length > 0 ) {

		/**
		 * @member {number} xLength Width of the volume in the IJK coordinate system
		 */
		this.xLength = Number( xLength ) || 1;
		/**
		 * @member {number} yLength Height of the volume in the IJK coordinate system
		 */
		this.yLength = Number( yLength ) || 1;
		/**
		 * @member {number} zLength Depth of the volume in the IJK coordinate system
		 */
		this.zLength = Number( zLength ) || 1;

		/**
		 * @member {TypedArray} data Data of the volume
		 */

		switch ( type ) {

			case 'Uint8' :
			case 'uint8' :
			case 'uchar' :
			case 'unsigned char' :
			case 'uint8_t' :
				this.data = new Uint8Array( arrayBuffer );
				break;
			case 'Int8' :
			case 'int8' :
			case 'signed char' :
			case 'int8_t' :
				this.data = new Int8Array( arrayBuffer );
				break;
			case 'Int16' :
			case 'int16' :
			case 'short' :
			case 'short int' :
			case 'signed short' :
			case 'signed short int' :
			case 'int16_t' :
				this.data = new Int16Array( arrayBuffer );
				break;
			case 'Uint16' :
			case 'uint16' :
			case 'ushort' :
			case 'unsigned short' :
			case 'unsigned short int' :
			case 'uint16_t' :
				this.data = new Uint16Array( arrayBuffer );
				break;
			case 'Int32' :
			case 'int32' :
			case 'int' :
			case 'signed int' :
			case 'int32_t' :
				this.data = new Int32Array( arrayBuffer );
				break;
			case 'Uint32' :
			case 'uint32' :
			case 'uint' :
			case 'unsigned int' :
			case 'uint32' :
			case 'uint32_t' :
				this.data = new Uint32Array( arrayBuffer );
				break;
			case 'longlong' :
			case 'long long' :
			case 'long long int' :
			case 'signed long long' :
			case 'signed long long int' :
			case 'int64' :
			case 'int64_t' :
			case 'ulonglong' :
			case 'unsigned long long' :
			case 'unsigned long long int' :
			case 'uint64' :
			case 'uint64_t' :
				throw 'Error in THREE.Volume constructor : this type is not supported in JavaScript';
				break;
			case 'Float32' :
			case 'float32' :
			case 'float' :
				this.data = new Float32Array( arrayBuffer );
				break;
			case 'Float64' :
			case 'float64' :
			case 'double' :
				this.data = new Float64Array( arrayBuffer );
				break;
			default :
				this.data = new Uint8Array( arrayBuffer );

		}

		if ( this.data.length !== this.xLength * this.yLength * this.zLength ) {

			throw 'Error in THREE.Volume constructor, lengths are not matching arrayBuffer size';

		}

	}

	/**
	 * @member {Array}  spacing Spacing to apply to the volume from IJK to RAS coordinate system
	 */
	this.spacing = [ 1, 1, 1 ];
	/**
	 * @member {Array}  offset Offset of the volume in the RAS coordinate system
	 */
	this.offset = [ 0, 0, 0 ];
	/**
	 * @member {THREE.Martrix3} matrix The IJK to RAS matrix
	 */
	this.matrix = new THREE.Matrix3();
	this.matrix.identity();
	/**
	 * @member {THREE.Martrix3} inverseMatrix The RAS to IJK matrix
	 */
	/**
	 * @member {number} lowerThreshold The voxels with values under this threshold won't appear in the slices.
	 *                      If changed, geometryNeedsUpdate is automatically set to true on all the slices associated to this volume
	 */
	var lowerThreshold = - Infinity;
	Object.defineProperty( this, 'lowerThreshold', {
		get : function() {

			return lowerThreshold;

		},
		set : function( value ) {

			lowerThreshold = value;
			this.sliceList.forEach( function( slice ) {

				slice.geometryNeedsUpdate = true

			} );

		}
	} );
	/**
	 * @member {number} upperThreshold The voxels with values over this threshold won't appear in the slices.
	 *                      If changed, geometryNeedsUpdate is automatically set to true on all the slices associated to this volume
	 */
	var upperThreshold = Infinity;
	Object.defineProperty( this, 'upperThreshold', {
		get : function() {

			return upperThreshold;

		},
		set : function( value ) {

			upperThreshold = value;
			this.sliceList.forEach( function( slice ) {

				slice.geometryNeedsUpdate = true;

			} );

		}
	} );


	/**
	 * @member {Array} sliceList The list of all the slices associated to this volume
	 */
	this.sliceList = [];


	/**
	 * @member {Array} RASDimensions This array holds the dimensions of the volume in the RAS space
	 */

}

THREE.Volume.prototype = {

	constructor : THREE.Volume,

	/**
	 * @member {Function} getData Shortcut for data[access(i,j,k)]
	 * @memberof THREE.Volume
	 * @param {number} i    First coordinate
	 * @param {number} j    Second coordinate
	 * @param {number} k    Third coordinate
	 * @returns {number}  value in the data array
	 */
	getData : function( i, j, k ) {

		return this.data[ k * this.xLength * this.yLength + j * this.xLength + i ];

	},

	/**
	 * @member {Function} access compute the index in the data array corresponding to the given coordinates in IJK system
	 * @memberof THREE.Volume
	 * @param {number} i    First coordinate
	 * @param {number} j    Second coordinate
	 * @param {number} k    Third coordinate
	 * @returns {number}  index
	 */
	access : function( i, j, k ) {

		return k * this.xLength * this.yLength + j * this.xLength + i;

	},

	/**
	 * @member {Function} reverseAccess Retrieve the IJK coordinates of the voxel corresponding of the given index in the data
	 * @memberof THREE.Volume
	 * @param {number} index index of the voxel
	 * @returns {Array}  [x,y,z]
	 */
	reverseAccess : function( index ) {

		var z = Math.floor( index / ( this.yLength * this.xLength ) );
		var y = Math.floor( ( index - z * this.yLength * this.xLength ) / this.xLength );
		var x = index - z * this.yLength * this.xLength - y * this.xLength;
		return [ x, y, z ];

	},

	/**
	 * @member {Function} map Apply a function to all the voxels, be careful, the value will be replaced
	 * @memberof THREE.Volume
	 * @param {Function} functionToMap A function to apply to every voxel, will be called with the following parameters :
	 *                                 value of the voxel
	 *                                 index of the voxel
	 *                                 the data (TypedArray)
	 * @param {Object}   context    You can specify a context in which call the function, default if this Volume
	 * @returns {THREE.Volume}   this
	 */
	map : function( functionToMap, context ) {

		var length = this.data.length;
		context = context || this;

		for ( var i = 0; i < length; i ++ ) {

			this.data[ i ] = functionToMap.call( context, this.data[ i ], i, this.data );

		}

		return this;

	},

	/**
	 * @member {Function} extractPerpendicularPlane Compute the orientation of the slice and returns all the information relative to the geometry such as sliceAccess, the plane matrix (orientation and position in RAS coordinate) and the dimensions of the plane in both coordinate system.
	 * @memberof THREE.Volume
	 * @param {string}            axis  the normal axis to the slice 'x' 'y' or 'z'
	 * @param {number}            index the index of the slice
	 * @returns {Object} an object containing all the usefull information on the geometry of the slice
	 */
	extractPerpendicularPlane : function( axis, RASIndex ) {

		var iLength,
		jLength,
		sliceAccess,
		planeMatrix = ( new THREE.Matrix4() ).identity(),
		volume = this,
		planeWidth,
		planeHeight,
		firstSpacing,
		secondSpacing,
		positionOffset,
		IJKIndex;

		var axisInIJK = new THREE.Vector3(),
		firstDirection = new THREE.Vector3(),
		secondDirection = new THREE.Vector3();

		var dimensions = new THREE.Vector3( this.xLength, this.yLength, this.zLength );


		switch ( axis ) {

			case 'x' :
				axisInIJK.set( 1, 0, 0 );
				firstDirection.set( 0, 0, - 1 );
				secondDirection.set( 0, - 1, 0 );
				firstSpacing = this.spacing[ 2 ];
				secondSpacing = this.spacing[ 1 ];
				IJKIndex = new THREE.Vector3( RASIndex, 0, 0 );

				planeMatrix.multiply( ( new THREE.Matrix4() ).makeRotationY( Math.PI / 2 ) );
				positionOffset = ( volume.RASDimensions[ 0 ] - 1 ) / 2;
				planeMatrix.setPosition( new THREE.Vector3( RASIndex - positionOffset, 0, 0 ) );
				break;
			case 'y' :
				axisInIJK.set( 0, 1, 0 );
				firstDirection.set( 1, 0, 0 );
				secondDirection.set( 0, 0, 1 );
				firstSpacing = this.spacing[ 0 ];
				secondSpacing = this.spacing[ 2 ];
				IJKIndex = new THREE.Vector3( 0, RASIndex, 0 );

				planeMatrix.multiply( ( new THREE.Matrix4() ).makeRotationX( - Math.PI / 2 ) );
				positionOffset = ( volume.RASDimensions[ 1 ] - 1 ) / 2;
				planeMatrix.setPosition( new THREE.Vector3( 0, RASIndex - positionOffset, 0 ) );
				break;
			case 'z' :
			default :
				axisInIJK.set( 0, 0, 1 );
				firstDirection.set( 1, 0, 0 );
				secondDirection.set( 0, - 1, 0 );
				firstSpacing = this.spacing[ 0 ];
				secondSpacing = this.spacing[ 1 ];
				IJKIndex = new THREE.Vector3( 0, 0, RASIndex );

				positionOffset = ( volume.RASDimensions[ 2 ] - 1 ) / 2;
				planeMatrix.setPosition( new THREE.Vector3( 0, 0, RASIndex - positionOffset ) );
				break;
		}

		firstDirection.applyMatrix4( volume.inverseMatrix ).normalize();
		firstDirection.argVar = 'i';
		secondDirection.applyMatrix4( volume.inverseMatrix ).normalize();
		secondDirection.argVar = 'j';
		axisInIJK.applyMatrix4( volume.inverseMatrix ).normalize();
		iLength = Math.floor( Math.abs( firstDirection.dot( dimensions ) ) );
		jLength = Math.floor( Math.abs( secondDirection.dot( dimensions ) ) );
		planeWidth = Math.abs( iLength * firstSpacing );
		planeHeight = Math.abs( jLength * secondSpacing );

		IJKIndex = Math.abs( Math.round( IJKIndex.applyMatrix4( volume.inverseMatrix ).dot( axisInIJK ) ) );
		var base = [ new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 1 ) ];
		var iDirection = [ firstDirection, secondDirection, axisInIJK ].find( function( x ) {

			return Math.abs( x.dot( base[ 0 ] ) ) > 0.9;

		} );
		var jDirection = [ firstDirection, secondDirection, axisInIJK ].find( function( x ) {

			return Math.abs( x.dot( base[ 1 ] ) ) > 0.9;

		} );
		var kDirection = [ firstDirection, secondDirection, axisInIJK ].find( function( x ) {

			return Math.abs( x.dot( base[ 2 ] ) ) > 0.9;

		} );
		var argumentsWithInversion = [ 'volume.xLength-1-', 'volume.yLength-1-', 'volume.zLength-1-' ];
		var arguments = [ 'i', 'j', 'k' ];
		var argArray = [ iDirection, jDirection, kDirection ].map( function( direction, n ) {

			return ( direction.dot( base[ n ] ) > 0 ? '' : argumentsWithInversion[ n ] ) + ( direction === axisInIJK ? 'IJKIndex' : direction.argVar )

		} );
		var argString = argArray.join( ',' );
		sliceAccess = eval( '(function sliceAccess (i,j) {return volume.access( ' + argString + ');})' );


		return {
			iLength : iLength,
			jLength : jLength,
			sliceAccess : sliceAccess,
			matrix : planeMatrix,
			planeWidth : planeWidth,
			planeHeight : planeHeight
		}

	},

	/**
	 * @member {Function} extractSlice Returns a slice corresponding to the given axis and index
	 *                        The coordinate are given in the Right Anterior Superior coordinate format
	 * @memberof THREE.Volume
	 * @param {string}            axis  the normal axis to the slice 'x' 'y' or 'z'
	 * @param {number}            index the index of the slice
	 * @returns {THREE.VolumeSlice} the extracted slice
	 */
	extractSlice : function( axis, index ) {

		var slice = new THREE.VolumeSlice( this, index, axis );
		this.sliceList.push( slice );
		return slice;

	},

	/**
	 * @member {Function} repaintAllSlices Call repaint on all the slices extracted from this volume
	 * @see THREE.VolumeSlice.repaint
	 * @memberof THREE.Volume
	 * @returns {THREE.Volume} this
	 */
	repaintAllSlices : function() {

		this.sliceList.forEach( function( slice ) {

			slice.repaint();

		} );

		return this;

	},

	/**
	 * @member {Function} computeMinMax Compute the minimum and the maximum of the data in the volume
	 * @memberof THREE.Volume
	 * @returns {Array} [min,max]
	 */
	computeMinMax : function() {

		var min = Infinity;
		var max = - Infinity;

		// buffer the length
		var datasize = this.data.length;

		var i = 0;
		for ( i = 0; i < datasize; i ++ ) {

			if ( ! isNaN( this.data[ i ] ) ) {

				var value = this.data[ i ];
				min = Math.min( min, value );
				max = Math.max( max, value );

			}

		}
		this.min = min;
		this.max = max;

		return [ min, max ];

	}

}
