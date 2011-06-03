/*
 * jQuery Mobile Framework : plugin to provide a date and time picker.
 * Copyright (c) JTSage
 * CC 3.0 Attribution.  May be relicensed without permission/notifcation.
 * https://github.com/jtsage/jquery-mobile-datebox
 */
(function($, undefined ) {
  $.widget( "mobile.datebox", $.mobile.widget, {
	options: {
		theme: 'c',
		pickPageTheme: 'b',
		pickPageInputTheme: 'e',
		pickPageButtonTheme: 'a',
		pickPageHighButtonTheme: 'e',
		pickPageTodayButtonTheme: 'e',
		noAnimation: false,
		
		disabled: false,
		zindex: '500',
		
		setDateButtonLabel: 'Set date',
		setTimeButtonLabel: 'Set time',
		titleDateDialogLabel: 'Set Date',
		titleTimeDialogLabel: 'Set Time',
		titleDialogLabel: false,
		meridiemLetters: ['AM', 'PM'],
		daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		daysOfWeekShort: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
		monthsOfYear: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novemeber', 'December'],
		timeFormat: 24,
		
		mode: 'datebox',
		calShowDays: true,
		calShowOnlyMonth: false,
		useDialogForceTrue: false,
		useDialogForceFalse: false,
		useDialog: false,
		useModal: false,
		useInline: false,
		noButtonFocusMode: false,
		noButton: false,
		closeCallback: false,
		
		fieldsOrder: ['m', 'd', 'y'],
		headerFormat: 'ddd, mmm dd, YYYY',
		dateFormat: 'YYYY-MM-DD',
		minuteStep: 1,
		calWeekMode: false,
		calWeekModeFirstDay: 1,
		calWeekModeHighlight: true,
		calStartDay: 0,
		defaultDate: false,
		minYear: false,
		maxYear: false,
		afterToday: false,
		maxDays: false,
		minDays: false,
		blackDays: false,
		blackDates: false,
		disabledDayColor: '#888'
	},
	_zeroPad: function(number) {
		return ( ( number < 10 ) ? "0" : "" ) + String(number);
	},
	_isInt: function (s) {
			return (s.toString().search(/^[0-9]+$/) === 0);
	},
	_dstAdjust: function(date) {
		if (!date) { return null; }
		date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
		return date;
	},
	_getFirstDay: function(date) {
		return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
	},
	_getLastDate: function(date) {
		return 32 - this._dstAdjust(new Date(date.getFullYear(), date.getMonth(), 32)).getDate();
	},
	_getLastDateBefore: function(date) {
		return 32 - this._dstAdjust(new Date(date.getFullYear(), date.getMonth()-1, 32)).getDate();
	},
	_formatHeader: function(date) {
		var header = this.options.headerFormat;
		header = header.replace('YYYY', date.getFullYear());
		header = header.replace('mmm',  this.options.monthsOfYear[date.getMonth()] );
		header = header.replace('MM',   this._zeroPad(date.getMonth() + 1));
		header = header.replace('mm',   date.getMonth() + 1);
		header = header.replace('ddd',  this.options.daysOfWeek[date.getDay()] );
		header = header.replace('DD',   this._zeroPad(date.getDate()));
		header = header.replace('dd',   date.getDate());
		return header;
	},
	_formatDate: function(date) {
		var dateStr = this.options.dateFormat;
		dateStr = dateStr.replace('YYYY', date.getFullYear());
		dateStr = dateStr.replace('MM', this._zeroPad(date.getMonth() + 1));
		dateStr = dateStr.replace('mm', (date.getMonth() + 1));
		dateStr = dateStr.replace('DD', this._zeroPad(date.getDate()));
		dateStr = dateStr.replace('dd', date.getDate());
		return dateStr;
	},
	_isoDate: function(y,m,d) {
		return String(y) + '-' + (( m < 10 ) ? "0" : "") + String(m) + '-' + ((d < 10 ) ? "0" : "") + String(d);
	},
	_formatTime: function(date) {
		var self = this,
			hours = '0',
			meri = 0;
			
		if ( this.options.timeFormat === 12 ) {
			if ( date.getHours() > 12 ) {
				meri = 1;
				hours = self._zeroPad(date.getHours() - 12);
			} else if ( date.getHours() === 12 ) {
				meri = 1;
				hours = '12';
			} else if ( date.getHours() === 0 ) {
				meri = 0;
				hours = '12';
			} else {
				meri = 0;
				hours = self._zeroPad(date.getHours());
			}
			return hours + ":" + self._zeroPad(date.getMinutes()) + ' ' + this.options.meridiemLetters[meri];
		} else {
			return self._zeroPad(date.getHours()) + ":" + self._zeroPad(date.getMinutes());
		}
	},
	_makeDate: function (str) {
		str = $.trim(str);
		var o = this.options,
			seperator = o.dateFormat.replace(/[myd ]/gi, "").substr(0,1),
			parts = o.dateFormat.split(seperator),
			data = str.split(seperator),
			date = new Date(),
			d_day = 1,
			d_mon = 0,
			d_yar = 2000,
			timeRegex = { '12': /^([012]?[0-9]):([0-5][0-9])\s*(am?|pm?)?$/i, '24': /^([012]?[0-9]):([0-5][0-9])$/i },
			match = null,
			i;
			
		if ( o.mode === 'timebox' ) {
			
			if ( o.timeFormat === 12 ) {
				match = timeRegex[o.timeFormat].exec(str);
				
				if( match === null || match.length < 3 ) { 
					return new Date();
				} else if ( match[1] < 12 && match[3].toLowerCase().charAt(0) === 'p' ) {  
					match[1] = parseInt(match[1],10) + 12;
				} else if ( match[1] === 12 ) {
					if ( match[3].toLowerCase().charAt(0) === 'a' ) { match[1] = 0; }
					else { match[1] = 12; }
				} else {
					match[1] = parseInt(match[1],10);
				}
			} else {
				match = timeRegex[o.timeFormat].exec(str);
				
				if( match === null || match.length < 2 || match[1] > 24 ) { 
					return new Date();
				}
			}
			
			date.setMinutes(match[2]);
			date.setHours(match[1]);
			
			return date;
		} else {
			if ( parts.length !== data.length ) { // Unrecognized string in input
				if ( o.defaultDate !== false ) {
					date = new Date(o.defaultDate);
					if ( ! date.getDate() ) {
						return new Date();
					} else {
						return date;
					}
				} else {
					return new Date();
				}
			} else { // Good string in input
				for ( i=0; i<parts.length; i++ ) {
					if ( parts[i].match(/d/i) ) { d_day = data[i]; }
					if ( parts[i].match(/m/i) ) { d_mon = data[i]; }
					if ( parts[i].match(/y/i) ) { d_yar = data[i]; }
				}
				date = new Date(d_yar, d_mon-1, d_day);
				if ( ! date.getDate() ) {
					return new Date();
				} else {
					return date;
				}
			}
		}
	},
	refresh: function() {
		this._update();
	},
	_update: function() {
		var self = this,
			o = self.options,
			testDate = null;
			
		if ( o.mode === 'timebox' ) {
			self.pickerMins.val(self._zeroPad(self.theDate.getMinutes()));
			if ( o.timeFormat === 12 ) {
				if ( self.theDate.getHours() > 11 ) {
					self.pickerMeri.val(o.meridiemLetters[1]);
					if ( self.theDate.getHours() === 12 ) {
						self.pickerHour.val(12);
					} else {
						self.pickerHour.val(self.theDate.getHours() - 12);
					}
				} else {
					self.pickerMeri.val(o.meridiemLetters[0]);
					if ( self.theDate.getHours() === 0 ) {
						self.pickerHour.val(12);
					} else {
						self.pickerHour.val(self.theDate.getHours());
					}
				}
			} else {
				self.pickerHour.val(self.theDate.getHours());
			}
		}
		if ( o.mode === 'datebox' ) {
			if ( o.afterToday !== false ) {
				testDate = new Date();
				if ( self.theDate < testDate ) { self.theDate = testDate; }
			}
			if ( o.maxDays !== false ) {
				testDate = new Date();
				testDate.setDate(testDate.getDate() + o.maxDays);
				if ( self.theDate > testDate ) { self.theDate = testDate; }
			}
			if ( o.minDays !== false ) {
				testDate = new Date();
				testDate.setDate(testDate.getDate() - o.minDays);
				if ( self.theDate < testDate ) { self.theDate = testDate; }
			}
			self.pickerDHeader.html( self._formatHeader(self.theDate) );
			self.pickerMon.val(self.theDate.getMonth() + 1);
			self.pickerDay.val(self.theDate.getDate());
			self.pickerYar.val(self.theDate.getFullYear());
		}
		if ( o.mode === 'calbox' ) { // Meat and potatos - make the calendar grid.
			self.pickerDate.text( o.monthsOfYear[self.theDate.getMonth()] + " " + self.theDate.getFullYear() );
			self.pickerGrid.html('');
			
			var start = self._getFirstDay(self.theDate),
				end = self._getLastDate(self.theDate),
				lastend = self._getLastDateBefore(self.theDate),
				presetDate = self._makeDate(self.input.val()),
				today = -1,
				highlightDay = -1,
				presetDay = -1,
				prevtoday = lastend - (start - 1),
				nexttoday = 1,
				currentMonth = false,
				thisDate = new Date(),
				maxDate = new Date(),
				minDate = new Date(),
				skipPrev = false,
				skipNext = false,
				skipThis = false,
				weekMode = 0,
				weekDays = null,
				thisRow = null,
				i, gridWeek, gridDay;
				
			if ( o.calStartDay > 0 ) {
				start = start - o.calStartDay;
				if ( start < 0 ) { start = start + 7; }
			}
				
			if ( thisDate.getMonth() === self.theDate.getMonth() && thisDate.getFullYear() === self.theDate.getFullYear() ) { currentMonth = true; highlightDay = thisDate.getDate(); } 
			if ( presetDate.getMonth() === self.theDate.getMonth() && presetDate.getFullYear() === self.theDate.getFullYear() ) { presetDay = presetDate.getDate(); }
			
			self.calNoPrev = false; self.calNoNext = false;
			
			if ( o.afterToday === true && 
				( currentMonth === true || ( thisDate.getMonth() > self.theDate.getMonth() && self.theDate.getFullYear() === thisDate.getFullYear() ) ) ) { 
				skipPrev = true; self.calNoPrev = true; }

			if ( o.minDays !== false ) {
				minDate.setDate(minDate.getDate() - o.minDays);
				if ( self.theDate.getFullYear() === minDate.getFullYear() && self.theDate.getMonth() <= minDate.getMonth() ) { skipPrev = true; self.calNoPrev = true;}
			}
			if ( o.maxDays !== false ) {
				maxDate.setDate(maxDate.getDate() + o.maxDays);
				if ( self.theDate.getFullYear() === maxDate.getFullYear() && self.theDate.getMonth() >= maxDate.getMonth() ) { skipNext = true; self.calNoNext = true;}
			}
			
			if ( o.calShowDays ) {
				if ( o.daysOfWeekShort.length < 8 ) { o.daysOfWeekShort = o.daysOfWeekShort.concat(o.daysOfWeekShort); }
				weekDays = $("<div>", {'class':'ui-datebox-gridrow'}).appendTo(self.pickerGrid);
				for ( i=0; i<=6;i++ ) {
					$("<div>"+o.daysOfWeekShort[i+o.calStartDay]+"</div>").addClass('ui-datebox-griddate ui-datebox-griddate-empty ui-datebox-griddate-label').appendTo(weekDays);
				}
			}
			
			for ( gridWeek=0; gridWeek<=5; gridWeek++ ) {
				if ( gridWeek === 0 || ( gridWeek > 0 && (today > 0 && today <= end) ) ) {
					thisRow = $("<div>", {'class': 'ui-datebox-gridrow'}).appendTo(self.pickerGrid);
					for ( gridDay=0; gridDay<=6; gridDay++) {
						if ( gridDay === 0 ) { weekMode = ( today < 1 ) ? (prevtoday - lastend + o.calWeekModeFirstDay) : (today + o.calWeekModeFirstDay); }
						if ( gridDay === start && gridWeek === 0 ) { today = 1; }
						if ( today > end ) { today = -1; }
						if ( today < 1 ) {
							if ( o.calShowOnlyMonth ) {
								$("<div>", {'class': 'ui-datebox-griddate ui-datebox-griddate-empty'}).appendTo(thisRow);
							} else {
								if (
									( o.blackDays !== false && $.inArray(gridDay, o.blackDays) > -1 ) ||
									( o.blackDates !== false && $.inArray(self._isoDate(self.theDate.getFullYear(), self.theDate.getMonth(), prevtoday), o.blackDates) > -1 ) ) {
										skipThis = true;
								} else { skipThis = false; }
									
								if ( gridWeek === 0 ) {
									$("<div>"+String(prevtoday)+"</div>")
										.addClass('ui-datebox-griddate ui-datebox-griddate-empty').appendTo(thisRow)
										.attr('data-date', ((o.calWeekMode)?(weekMode+lastend):prevtoday))
										.bind((!skipThis)?'vclick':'error', function(e) {
											e.preventDefault();
											if ( !skipPrev ) {
												self.theDate.setMonth(self.theDate.getMonth() - 1);
												self.theDate.setDate($(this).attr('data-date'));
												self.input.val(self._formatDate(self.theDate)).trigger('change');
												self.close();
											}
										});
									prevtoday++;
								} else {
									$("<div>"+String(nexttoday)+"</div>")
										.addClass('ui-datebox-griddate ui-datebox-griddate-empty').appendTo(thisRow)
										.attr('data-date', ((o.calWeekMode)?weekMode:nexttoday))
										.bind((!skipThis)?'vclick':'error', function(e) {
											e.preventDefault();
											if ( !skipNext ) {
												self.theDate.setDate($(this).attr('data-date'));
												if ( !o.calWeekMode ) { self.theDate.setMonth(self.theDate.getMonth() + 1); }
												self.input.val(self._formatDate(self.theDate)).trigger('change');
												self.close();
											}
										});
									nexttoday++;
								}
							}
						} else {
							if ( !o.afterToday && !o.maxDays && !o.minDays && !o.blackDates && !o.blackDays ) {
								skipThis = false;
							} else {
								skipThis = false;
								if ( o.afterToday ) {
									if ( 
										( self.theDate.getFullYear() === thisDate.getFullYear() && self.theDate.getMonth() === thisDate.getMonth() && today < thisDate.getDate() ) ||
										( self.theDate.getFullYear() < thisDate.getFullYear() ) ) {
											skipThis = true;
									}
								} 
								if ( !skipThis && o.maxDays !== false ) {
									if (
										( self.theDate.getFullYear() > maxDate.getFullYear() ) ||
										( self.theDate.getFullYear() === maxDate.getFullYear() && self.theDate.getMonth() > maxDate.getMonth() ) ||
										( self.theDate.getFullYear() === maxDate.getFullYear() && self.theDate.getMonth() === maxDate.getMonth() && today > maxDate.getDate() ) ) {
											skipThis = true;
									}
								} 
								if ( !skipThis && o.minDays !== false ) {
									if (
										( self.theDate.getFullYear() < minDate.getFullYear() ) ||
										( self.theDate.getFullYear() === minDate.getFullYear() && self.theDate.getMonth() < minDate.getMonth() ) ||
										( self.theDate.getFullYear() === minDate.getFullYear() && self.theDate.getMonth() === minDate.getMonth() && today < minDate.getDate() ) ) {
											skipThis = true;
									}
								} 
								if ( !skipThis && ( o.blackDays !== false || o.blackDates !== false ) ) { // Blacklists
									if ( 
										( $.inArray(gridDay, o.blackDays) > -1 ) ||
										( $.inArray(self._isoDate(self.theDate.getFullYear(), self.theDate.getMonth()+1, today), o.blackDates) > -1 ) ) { 
											skipThis = true;
									}
								}
							}
							
							$("<div>"+String(today)+"</div>")
								.addClass('ui-datebox-griddate ui-corner-all')
								.attr('data-date', ((o.calWeekMode)?weekMode:today))
								.attr('data-theme', ((today===highlightDay)?o.pickPageTodayButtonTheme:((today===presetDay)?o.pickPageHighButtonTheme:o.pickPageButtonTheme)))
								.appendTo(thisRow)
								.addClass('ui-btn-up-'+((today===highlightDay)?o.pickPageTodayButtonTheme:((today===presetDay)?o.pickPageHighButtonTheme:o.pickPageButtonTheme)))
								.hover(
									function() { 
										if ( o.calWeekMode !== false && o.calWeekModeHighlight === true ) {
											$(this).parent().find('div').each(function() {
												$(this).addClass('ui-btn-down-'+$(this).attr('data-theme')).removeClass('ui-btn-up-'+$(this).attr('data-theme')); });
										} else {
											$(this).addClass('ui-btn-down-'+$(this).attr('data-theme')).removeClass('ui-btn-up-'+$(this).attr('data-theme')); 
										}
									},
									function() { 
										if ( o.calWeekMode !== false && o.calWeekModeHighlight === true ) {
											$(this).parent().find('div').each(function() {
												$(this).addClass('ui-btn-up-'+$(this).attr('data-theme')).removeClass('ui-btn-down-'+$(this).attr('data-theme')); });
										} else {
											$(this).addClass('ui-btn-up-'+$(this).attr('data-theme')).removeClass('ui-btn-down-'+$(this).attr('data-theme')); 
										}
									}
								)
								.bind((!skipThis)?'vclick':'error', function(e) {
										e.preventDefault();
										self.theDate.setDate($(this).attr('data-date'));
										self.input.val(self._formatDate(self.theDate));
										self.close();
										self.input.trigger('change');
								})
								.css((skipThis)?'color':'nocolor', o.disabledDayColor);
							
							today++;
						}
					}
				}
			}
		}
	},
	open: function() {
		this.input.trigger('change').blur();
		
		var self = this,
			o = this.options,
			inputOffset = self.focusedEl.offset(),
			pickWinHeight = self.pickerContent.outerHeight(),
			pickWinWidth = self.pickerContent.innerWidth(),
			pickWinTop = inputOffset.top + ( self.focusedEl.outerHeight() / 2 )- ( pickWinHeight / 2),
			pickWinLeft = inputOffset.left + ( self.focusedEl.outerWidth() / 2) - ( pickWinWidth / 2),
			windowWidth = $(document).width();

		if ( o.useInline ) { return false; }
					
		if ( (pickWinHeight + pickWinTop) > $(document).height() ) {
			pickWinTop = $(document).height() - (pickWinHeight + 2);
		}
		if ( pickWinTop < 45 ) { pickWinTop = 45; }
		
		if ( ( windowWidth > 400 && !o.useDialogForceTrue ) || o.useDialogForceFalse ) {
			self.options.useDialog = false;
			if ( o.useModal ) {
				self.screen.fadeIn('slow');
			} else {
				self.screen.removeClass('ui-datebox-hidden');
			}
			self.pickerContent.addClass('ui-overlay-shadow in').css({'position': 'absolute', 'top': pickWinTop, 'left': pickWinLeft}).removeClass('ui-datebox-hidden');
		} else {
			self.options.useDialog = true;
			self.pickPageContent.append(self.pickerContent);
			self.pickerContent.css({'top': 'auto', 'left': 'auto', 'marginLeft': 'auto', 'marginRight': 'auto'}).removeClass('ui-overlay-shadow ui-datebox-hidden');
			$.mobile.changePage(self.pickPage, 'pop', false, true);
		}
	},
	close: function() {
		var self = this,
			callback;

		if ( self.options.useInline ) {
			return true;
		}

		if ( self.options.useDialog ) {
			$(self.pickPage).dialog('close');
			self.pickerContent.addClass('ui-datebox-hidden').removeAttr('style').css('zIndex', self.options.zindex);
			self.thisPage.append(self.pickerContent);
		} else {
			if ( self.options.useModal ) {
				self.screen.fadeOut('slow');
			} else {
				self.screen.addClass('ui-datebox-hidden');
			}
			self.pickerContent.addClass('ui-datebox-hidden').removeAttr('style').css('zIndex', self.options.zindex).removeClass('in');
		}
		self.focusedEl.removeClass('ui-focus');
		
		if ( self.options.closeCallback !== false ) { callback = new Function(self.options.closeCallback); callback(); }
	},
	_create: function() {
		var self = this,
			o = $.extend(this.options, this.element.data('options')),
			input = this.element,
			focusedEl = input.wrap('<div class="ui-input-datebox ui-shadow-inset ui-corner-all ui-body-'+ o.theme +'"></div>').parent(),
			theDate = new Date(),
			dialogTitle = ((o.titleDialogLabel === false)?((o.mode==='timebox')?o.titleTimeDialogLabel:o.titleDateDialogLabel):o.titleDialogLabel),
			openbutton = $('<a href="#" class="ui-input-clear" title="date picker">date picker</a>')
				.bind('vclick', function (e) {
					e.preventDefault();
					if ( !o.disabled ) { self.open(); }
					setTimeout( function() { $(e.target).closest("a").removeClass($.mobile.activeBtnClass); }, 300);
				})
				.appendTo(focusedEl).buttonMarkup({icon: 'grid', iconpos: 'notext', corners:true, shadow:true})
				.css({'vertical-align': 'middle', 'float': 'right'}),
			thisPage = input.closest('.ui-page'),
			pickPage = $("<div data-role='dialog' class='ui-dialog-datebox' data-theme='" + o.pickPageTheme + "' >" +
						"<div data-role='header' data-backbtn='false' data-theme='a'>" +
							"<div class='ui-title'>" + dialogTitle + "</div>"+
						"</div>"+
						"<div data-role='content'></div>"+
					"</div>")
					.appendTo( $.mobile.pageContainer )
					.page().css('minHeight', '0px').css('zIndex', o.zindex).addClass('pop'),
			pickPageContent = pickPage.find( ".ui-content" );
			
		$('label[for='+input.attr('id')+']').addClass('ui-input-text').css('verticalAlign', 'middle');
			
		if ( o.noButtonFocusMode || o.useInline || o.noButton ) { openbutton.hide(); }
		
		focusedEl.tap(function() {
			if ( !o.disabled && o.noButtonFocusMode ) { self.open(); }
		});
		
		input
			.removeClass('ui-corner-all ui-shadow-inset')
			.focus(function(){
				if ( ! o.disabled ) {
					focusedEl.addClass('ui-focus');
					if ( o.noButtonFocusMode ) { focusedEl.addClass('ui-focus'); self.open(); }
				}
				input.removeClass('ui-focus');
			})
			.blur(function(){
				focusedEl.removeClass('ui-focus');
				input.removeClass('ui-focus');
			})
			.change(function() {
				self.theDate = self._makeDate(self.input.val());
				self._update();
			});
		
		pickPage.find( ".ui-header a").bind('vclick', function(e) {
			e.preventDefault();
			e.stopImmediatePropagation();
			self.close();
		});

		$.extend(self, {
			pickPage: pickPage,
			thisPage: thisPage,
			pickPageContent: pickPageContent,
			input: input,
			theDate: theDate,
			focusedEl: focusedEl
		});
		
		self._buildPage();
		
		if ( input.is(':disabled') ) {
			self.disable();
		}
	},
	_incrementField: function(fieldOrder) {
		var o = this.options,
			self = this;
		fieldOrder = parseInt(fieldOrder, 10);

		if ( o.mode === 'timebox' ) {
			if ( fieldOrder === 0 ) { self.theDate.setHours(self.theDate.getHours() + 1); }
			if ( fieldOrder === 1 ) {
				if ( ( self.theDate.getMinutes() % o.minuteStep ) === 0 ) { 
					self.theDate.setMinutes(self.theDate.getMinutes() + o.minuteStep);
				} else { 
					self.theDate.setMinutes(self.theDate.getMinutes() + ( o.minuteStep - ( self.theDate.getMinutes() % o.minuteStep ) ));
				}
			}
			if ( fieldOrder === 2 && o.timeFormat === 12 ) { 
				if ( self.pickerMeri.val() === o.meridiemLetters[0] ) { 
					self.pickerMeri.val(o.meridiemLetters[1]);
					self.theDate.setHours(self.theDate.getHours() + 12);
				} else {
					self.pickerMeri.val(o.meridiemLetters[0]);
					self.theDate.setHours(self.theDate.getHours() - 12);
				}
			}
		} else {
			if ( o.fieldsOrder[fieldOrder] === 'y' ) { 
				if ( o.maxYear === false || (self.theDate.getFullYear() + 1 <= o.maxYear) ) { 
					self.theDate.setYear(self.theDate.getFullYear() + 1); 
				}
			}
			if ( o.fieldsOrder[fieldOrder] === 'm' ) { self.theDate.setMonth(self.theDate.getMonth() + 1); }
			if ( o.fieldsOrder[fieldOrder] === 'd' ) { self.theDate.setDate(self.theDate.getDate() + 1); }
		}
	
		self._update();
	},
	_decrementField: function(fieldOrder) {
		var o = this.options,
			self = this;
		fieldOrder = parseInt(fieldOrder, 10);
			
		if ( o.mode === 'timebox' ) {
			if ( fieldOrder === 0 ) { self.theDate.setHours(self.theDate.getHours() - 1); }
			if ( fieldOrder === 1 ) {
				if ( (self.theDate.getMinutes() % o.minuteStep) === 0 ) {
					self.theDate.setMinutes(self.theDate.getMinutes() - o.minuteStep);
				} else {
					self.theDate.setMinutes(self.theDate.getMinutes() - (self.theDate.getMinutes() % o.minuteStep));
				}
			}
			if ( fieldOrder === 2 && o.timeFormat === 12 ) { 
				if ( self.pickerMeri.val() === o.meridiemLetters[0] ) { 
					self.pickerMeri.val(o.meridiemLetters[1]);
					self.theDate.setHours(self.theDate.getHours() + 12);
				} else {
					self.pickerMeri.val(o.meridiemLetters[0]);
					self.theDate.setHours(self.theDate.getHours() - 12);
				}
			}
		} else {
			if ( o.fieldsOrder[fieldOrder] === 'y' ) {
				if ( o.minYear === false || ( self.theDate.getFullYear() - 1 >= o.minYear ) ) { 
					self.theDate.setYear(self.theDate.getFullYear() - 1); 
				}
			}
			if ( o.fieldsOrder[fieldOrder] === 'm' ) { self.theDate.setMonth(self.theDate.getMonth() - 1); }
			if ( o.fieldsOrder[fieldOrder] === 'd' ) { self.theDate.setDate(self.theDate.getDate() - 1); }
		}
		this._update();
	},
	_buildPage: function () {
		var self = this,
			o = self.options, x, newHour,
			pickerContent = $("<div>", { "class": 'ui-datebox-container ui-overlay-shadow ui-corner-all ui-datebox-hidden pop ui-body-'+o.pickPageTheme} ).css('zIndex', o.zindex),
			screen = $("<div>", {'class':'ui-datebox-screen ui-datebox-hidden'+((o.useModal)?' ui-datebox-screen-modal':'')})
				.css({'z-index': o.zindex-1})
				.appendTo(self.thisPage)
				.bind("vclick", function(event) {
					self.close();
					event.preventDefault();
				});
		
		if ( o.noAnimation ) { pickerContent.removeClass('pop');	}
		
		if ( o.mode === 'timebox' ) {
			var pickerTPlus = $("<div>", { "class":'ui-datebox-controls' }).appendTo(pickerContent),
				pickerTInput = $("<div>", { "class":'ui-datebox-controls' }).appendTo(pickerContent),
				pickerTMinus = $("<div>", { "class":'ui-datebox-controls' }).appendTo(pickerContent),
				pickerTSet = $("<div>", { "class":'ui-datebox-controls'}).appendTo(pickerContent),
				
				pickerHour = $("<input type='text' />")
					.keyup(function() {
						if ( $(this).val() !== '' && self._isInt($(this).val()) ) {
							newHour = parseInt($(this).val(),10);
							if ( newHour === 12 ) {
								if ( o.timeFormat === 12 && pickerMeri.val() === o.meridiemLetters[0] ) { newHour = 0; }
							}
							self.theDate.setHours(newHour);
							self._update();
						}
					}).addClass('ui-input-text ui-corner-all ui-shadow-inset ui-datebox-input ui-body-'+o.pickPageInputTheme),
				
				pickerMins = $("<input type='text' />")
					.keyup(function() {
						if ( $(this).val() !== '' && self._isInt($(this).val()) ) {
							self.theDate.setMinutes(parseInt($(this).val(),10));
							self._update();
						}
					}).addClass('ui-input-text ui-corner-all ui-shadow-inset ui-datebox-input ui-body-'+o.pickPageInputTheme),
				
				pickerMeri = $("<input type='text' />")
					.keyup(function() {
						if ( $(this).val() !== '' ) {
							self._update();
						}
					}).addClass('ui-input-text ui-corner-all ui-shadow-inset ui-datebox-input ui-body-'+o.pickPageInputTheme);
			
			pickerHour.appendTo(pickerTInput);
			pickerMins.appendTo(pickerTInput);
			if ( o.timeFormat === 12 ) { pickerMeri.appendTo(pickerTInput); }
			
			$("<a href='#'>" + o.setTimeButtonLabel + "</a>")
				.appendTo(pickerTSet).buttonMarkup({theme: o.pickPageTheme, icon: 'check', iconpos: 'left', corners:true, shadow:true})
				.click(function(e) {
					e.preventDefault();
					self.input.val(self._formatTime(self.theDate));
					self.close();
					self.input.trigger('change');
				});
				
			for ( x=0; x<((o.timeFormat === 12)?3:2); x++ ) {
				$("<div><a href='#'></a></div>")
					.appendTo(pickerTPlus).buttonMarkup({theme: o.pickPageButtonTheme, icon: 'plus', iconpos: 'bottom', corners:true, shadow:true})
					.attr('data-field', x)
					.bind('vclick', function(e) {
						e.preventDefault();
						self._incrementField($(this).attr('data-field'));
					});
					
				$("<div><a href='#'></a></div>")
					.appendTo(pickerTMinus).buttonMarkup({theme: o.pickPageButtonTheme, icon: 'minus', iconpos: 'top', corners:true, shadow:true})
					.attr('data-field', x)
					.bind('vclick', function(e) {
						e.preventDefault();
						self._decrementField($(this).attr('data-field'));
					});
			}
			
			$.extend(self, {
				pickerHour: pickerHour,
				pickerMins: pickerMins,
				pickerMeri: pickerMeri
			});
			
			pickerContent.appendTo(self.thisPage);
		}
		
		if ( o.mode === 'datebox' ) {
			var pickerDHeader = $("<div class='ui-datebox-header'><h4>Unitialized</h4></div>").appendTo(pickerContent).find("h4"),
				pickerDPlus = $("<div>", { "class":'ui-datebox-controls' }).appendTo(pickerContent),
				pickerDInput = $("<div>", { "class":'ui-datebox-controls' }).appendTo(pickerContent),
				pickerDMinus = $("<div>", { "class":'ui-datebox-controls' }).appendTo(pickerContent),
				pickerDSet = $("<div>", { "class":'ui-datebox-controls'}).appendTo(pickerContent),
				
				pickerMon = $("<input type='text' />")
					.keyup(function() {
						if ( $(this).val() !== '' && self._isInt($(this).val()) ) {
							self.theDate.setMonth(parseInt($(this).val(),10)-1);
							self._update();
						}
					}).addClass('ui-input-text ui-corner-all ui-shadow-inset ui-datebox-input ui-body-'+o.pickPageInputTheme),
				
				pickerDay = $("<input type='text' />")
					.keyup(function() {
						if ( $(this).val() !== '' && self._isInt($(this).val()) ) {
							self.theDate.setDate(parseInt($(this).val(),10));
							self._update();
						}
					}).addClass('ui-input-text ui-corner-all ui-shadow-inset ui-datebox-input ui-body-'+o.pickPageInputTheme),
				
				pickerYar = $("<input type='text' />")
					.keyup(function() {
						if ( $(this).val() !== '' && self._isInt($(this).val()) ) {
							self.theDate.setYear(parseInt($(this).val(),10));
							self._update();
						}
					}).addClass('ui-input-text ui-corner-all ui-shadow-inset ui-datebox-input ui-body-'+o.pickPageInputTheme);
		
				for(x=0; x<=o.fieldsOrder.length; x++) {
					if (self.options.fieldsOrder[x] === 'y') { pickerYar.appendTo(pickerDInput); }
					if (self.options.fieldsOrder[x] === 'm') { pickerMon.appendTo(pickerDInput); }
					if (self.options.fieldsOrder[x] === 'd') { pickerDay.appendTo(pickerDInput); }
				}
		
			$("<a href='#'>" + o.setDateButtonLabel + "</a>")
				.appendTo(pickerDSet).buttonMarkup({theme: o.pickPageTheme, icon: 'check', iconpos: 'left', corners:true, shadow:true})
				.bind('vclick', function(e) {
					e.preventDefault();
					self.input.val(self._formatDate(self.theDate));
					self.close();
					self.input.trigger('change');
				});
			
			for( x=0; x<self.options.fieldsOrder.length; x++ ) {
				$("<div><a href='#'></a></div>")
					.appendTo(pickerDPlus).buttonMarkup({theme: o.pickPageButtonTheme, icon: 'plus', iconpos: 'bottom', corners:true, shadow:true})
					.attr('data-field', x)
					.bind('vclick', function(e) {
						e.preventDefault();
						self._incrementField($(this).attr('data-field'));
				});
				$("<div><a href='#'></a></div>")
					.appendTo(pickerDMinus).buttonMarkup({theme: o.pickPageButtonTheme, icon: 'minus', iconpos: 'top', corners:true, shadow:true})
					.attr('data-field', x)
					.bind('vclick', function(e) {
						e.preventDefault();
						self._decrementField($(this).attr('data-field'));
				});
			}
				
			$.extend(self, {
				pickerDHeader: pickerDHeader,
				pickerDay: pickerDay,
				pickerMon: pickerMon,
				pickerYar: pickerYar
			});
			
			pickerContent.appendTo(self.thisPage);
		}
		
		if ( o.mode === 'calbox' ) {
			var pickerHeader = $("<div>", {"class": 'ui-datebox-gridheader'}).appendTo(pickerContent),
				pickerGrid = $("<div>", {"class": 'ui-datebox-grid'}).appendTo(pickerContent),
				calNoNext = false,
				calNoPrev = false,
				pickerDate = $("<div class='ui-datebox-gridlabel'><h4>Uninitialized</h4></div>").appendTo(pickerHeader).find('h4');
				
			$("<div class='ui-datebox-gridplus'><a href='#'>Next Month</a></div>")
				.prependTo(pickerHeader).buttonMarkup({theme: o.pickPageButtonTheme, icon: 'plus', inline: true, iconpos: 'notext', corners:true, shadow:true})
				.bind('vclick', function(e) {
					e.preventDefault();
					if ( ! self.calNoNext ) {
						if ( self.theDate.getDate() > 28 ) { self.theDate.setDate(1); }
						self.theDate.setMonth(self.theDate.getMonth() + 1);
					}
					self._update();
				});
			$("<div class='ui-datebox-gridminus'><a href='#'>Prev Month</a></div>")
				.prependTo(pickerHeader).buttonMarkup({theme: o.pickPageButtonTheme, icon: 'minus', inline: true, iconpos: 'notext', corners:true, shadow:true})
				.bind('vclick', function(e) {
					e.preventDefault();
					if ( ! self.calNoPrev ) {
						if ( self.theDate.getDate() > 28 ) { self.theDate.setDate(1); }
						self.theDate.setMonth(self.theDate.getMonth() - 1);
					}
					self._update();
				});
				
					
			$.extend(self, {
				pickerDate: pickerDate,
				pickerGrid: pickerGrid,
				calNoNext: calNoNext,
				calNoPrev: calNoPrev
			});
			
			pickerContent.appendTo(self.thisPage);
		}

		$.extend(self, {
			pickerContent: pickerContent,
			screen: screen
		});
		
		if ( o.useInline ) { 
			self.input.parent().parent().append(self.pickerContent);
			if ( o.useInlineHideInput ) { self.input.parent().hide(); }
			self.input.trigger('change');
			self.pickerContent.removeClass('ui-datebox-hidden');
		}
			
	},
	disable: function(){
		this.element.attr("disabled",true);
		this.element.parent().addClass("ui-disabled");
		this.options.disabled = true;
		this.element.blur();
	},
	enable: function(){
		this.element.attr("disabled", false);
		this.element.parent().removeClass("ui-disabled");
		this.options.disabled = false;
	}
	
  });
	
  $( ".ui-page" ).live( "pagecreate", function() { 
	$( 'input[data-role="datebox"]', this ).each(function() {
		$(this).datebox();
	});
	
	/* Next is for compat with old CalendarBox */
	$( 'input[data-role="calendarbox"]', this ).each(function() {
		$(this).datebox({'mode': 'calbox'});
	});

  });
	
})( jQuery );
