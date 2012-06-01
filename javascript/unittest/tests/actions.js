(function() {
	var actions = zen_coding.require('actions');
	var run = function(name) {
		actions.run(name, editorStub);
	};
	
	var caret = zen_coding.require('utils').getCaretPlaceholder();
	
	module('Actions');
	QUnit.moduleStart(function(obj) {
		if (obj.name == 'Actions') {
			zen_coding.require('utils').setCaretPlaceholder('|');
		}
	});
	
	QUnit.moduleDone(function(obj) {
		if (obj.name == 'Actions') {
			zen_coding.require('utils').setCaretPlaceholder(caret);
		}
	});
	
	test('Expand Abbreviatoin', function() {
		var content = 'a>b| test';
		editorStub.replaceContent(content);
		
		run('expand_abbreviation');
		equal(editorStub.getContent(), '<a href=""><b></b></a> test', 'Expanded abbreviation ' + content);
		equal(editorStub.getCaretPos(), 9, 'Correctly placed cursor in ' + content);
	});
	
	test('Move to edit points', function() {
		var content = '|<a href="">\n\t<b></b>\n\t\n</a>';
		editorStub.replaceContent(content);
		
		run('next_edit_point');
		equal(editorStub.getCaretPos(), 9, 'Movet caret into empty attribute (forward)');
		
		run('next_edit_point');
		equal(editorStub.getCaretPos(), 16, 'Movet caret into <b> tag (forward)');
		
		run('next_edit_point');
		equal(editorStub.getCaretPos(), 22, 'Movet caret into empty line (forward)');
		
		run('next_edit_point');
		equal(editorStub.getCaretPos(), 22, 'No movement (forward)');
		
		editorStub.setCaretPos(content.length);
		
		run('prev_edit_point');
		equal(editorStub.getCaretPos(), 22, 'Movet caret into empty line (backward)');
		
		run('prev_edit_point');
		equal(editorStub.getCaretPos(), 16, 'Movet caret into <b> tag (backward)');
		
		run('prev_edit_point');
		equal(editorStub.getCaretPos(), 9, 'Movet caret into empty attribute (backward)');
		
		run('prev_edit_point');
		equal(editorStub.getCaretPos(), 9, 'No movement (backward)');
	});
	
	test('Evaluate math expression', function() {
		var content = 'hello 2+4| world';
		editorStub.replaceContent(content);
		run('evaluate_math_expression');
		equal(editorStub.getContent(), 'hello 6 world', 'Evaluated expression in ' + content);
		
		editorStub.replaceContent(content = 'hello 2*4| world');
		run('evaluate_math_expression');
		equal(editorStub.getContent(), 'hello 8 world', 'Evaluated expression in ' + content);
		
		editorStub.replaceContent(content = 'hello 12*4| world');
		editorStub.createSelection(7, 10);
		run('evaluate_math_expression');
		equal(editorStub.getContent(), 'hello 18 world', 'Evaluated expression in ' + content);
		
		editorStub.replaceContent(content = 'hello 11\\2| world');
		run('evaluate_math_expression');
		equal(editorStub.getContent(), 'hello 6 world', 'Evaluated expression in ' + content);
	});
	
	test('Increment/decrement', function() {
		editorStub.replaceContent('a 1| b');
		run('increment_number_by_1');
		equal(editorStub.getContent(), 'a 2 b', 'Incremented number by 1');
		
		run('increment_number_by_10');
		equal(editorStub.getContent(), 'a 12 b', 'Incremented number by 10');
		
		run('increment_number_by_01');
		equal(editorStub.getContent(), 'a 12.1 b', 'Incremented number by 0.1');
		
		editorStub.setCaretPos(4);
		run('decrement_number_by_01');
		equal(editorStub.getContent(), 'a 12 b', 'Decremented number by 0.1');
		
		run('decrement_number_by_10');
		equal(editorStub.getContent(), 'a 2 b', 'Decremented number by 10');
		
		run('decrement_number_by_1');
		equal(editorStub.getContent(), 'a 1 b', 'Decremented number by 1');
		
		editorStub.replaceContent('index|1.html');
		run('increment_number_by_1');
		equal(editorStub.getContent(), 'index2.html', 'Incremented number in filename by 1');
		
	});
	
	test('Formatted line breaks', function() {
		editorStub.replaceContent('<a>|</a>');
		run('insert_formatted_line_break');
		equal(editorStub.getContent(), '<a>\n\t\n</a>', 'Inserted linebreak between HTML tags');
		
		run('insert_formatted_line_break');
		equal(editorStub.getContent(), '<a>\n\t\n\t\n</a>', 'Inserted linebreak with indentation');
		
		editorStub.setSyntax('css');
		
		editorStub.replaceContent('.a {|');
		run('insert_formatted_line_break');
		equal(editorStub.getContent(), '.a {\n\t\n}', 'Inserted linebreak after CSS open brace');
		
		editorStub.replaceContent('.a {|}');
		run('insert_formatted_line_break');
		equal(editorStub.getContent(), '.a {\n\t\n}', 'Inserted linebreak in CSS braces');
		
		editorStub.replaceContent('.a |{}');
		run('insert_formatted_line_break');
		equal(editorStub.getContent(), '.a \n{}', 'Inserted linebreak in CSS braces');
		
		editorStub.setSyntax('html');
	});
	
	test('Match pair', function() {
		editorStub.replaceContent('Lorem <a><b>ip|sum</b></a> dolor sit amet');
		
		run('match_pair_outward');
		deepEqual(editorStub.getSelectionRange(), {start: 12, end: 17}, 'Matched tag content');
		
		run('match_pair_outward');
		deepEqual(editorStub.getSelectionRange(), {start: 9, end: 21}, 'Matched tag <b>');
		
		run('match_pair_outward');
		deepEqual(editorStub.getSelectionRange(), {start: 6, end: 25}, 'Matched tag <a>');
		
		run('match_pair_inward');
		deepEqual(editorStub.getSelectionRange(), {start: 9, end: 21}, 'Matched tag <b> (inward)');
		
		run('match_pair_inward');
		deepEqual(editorStub.getSelectionRange(), {start: 12, end: 17}, 'Matched tag content (inward)');
	});
	
	test('Merge lines', function() {
		editorStub.replaceContent('<b>\n\n|\n\n</b>');
		
		run('merge_lines');
		equal(editorStub.getContent(), '<b></b>', 'Automatched and merged tag content');
		
		editorStub.replaceContent('a\nb\nc\nd\ne');
		editorStub.createSelection(4, 9);
		run('merge_lines');
		equal(editorStub.getContent(), 'a\nb\ncde', 'Merged selected lines');
	});
	
	test('Reflect CSS Value', function() {
		editorStub.setSyntax('css');
		
		editorStub.replaceContent('a {p:1; -a-p:12|; -b-p:1; x:1;}');
		run('reflect_css_value');
		equal(editorStub.getContent(), 'a {p:12; -a-p:12; -b-p:12; x:1;}', 'Reflected value of -a-p');
		equal(editorStub.getCaretPos(), 16, 'Correctly adjusted caret position');
		
		editorStub.replaceContent('a {opacity: 0.5|; filter: alpha(opacity=60)}');
		run('reflect_css_value');
		equal(editorStub.getContent(), 'a {opacity: 0.5; filter: alpha(opacity=50)}', 'Custom reflection for opacity');
		
		editorStub.replaceContent('a {border-top-left-radius: 10px|; -moz-border-radius-topleft: 5px;}');
		run('reflect_css_value');
		equal(editorStub.getContent(), 'a {border-top-left-radius: 10px; -moz-border-radius-topleft: 10px;}', 'Custom reflection for border radius');
		
		editorStub.setSyntax('html');
	});
	
	test('Remove tag', function() {
		editorStub.replaceContent('hello\n<di|v>\n\t<span>world</span>\n</div>');
		run('remove_tag');
		equal(editorStub.getContent(), 'hello\n<span>world</span>', 'Removed <div> tag');
		
		editorStub.replaceContent('hello <img| src="" alt="" /> world');
		run('remove_tag');
		equal(editorStub.getContent(), 'hello  world', 'Removed <img /> tag');
	});
	
	test('Select prev/next item (CSS)', function() {
		editorStub.setSyntax('css');
		
		editorStub.replaceContent('|a {color: red; border: 1px solid black;}');
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 0, end: 1}, 'Selector matched');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 3, end: 14}, 'Full property matched');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 10, end: 13}, 'Property value matched');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 15, end: 39}, 'Advanced to next property');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 23, end: 38}, 'Selected "border" property value');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 23, end: 26}, 'Selected "1px" of "border" property');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 27, end: 32}, 'Selected "solid" of "border" property');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 33, end: 38}, 'Selected "black" of "border" property');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 33, end: 38}, 'No selection change');
		
		// test previous item
		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 27, end: 32}, 'Selected "solid" of "border" property (backward)');
		
		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 23, end: 26}, 'Selected "1px" of "border" property (backward)');
		
		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 23, end: 38}, 'Selected "border" property value');
		
		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 15, end: 39}, 'Advanced to previous property');
		
		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 10, end: 13}, 'Previous property value matched');
		
		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 3, end: 14}, 'Previous property fully matched');
		
		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 0, end: 1}, 'Selector matched (backward)');
		
		editorStub.setSyntax('html');
	});
	
	test('Select prev/next item (HTML)', function() {
		editorStub.replaceContent('|<div class="hello world" b=1>text</div> <b class="large">text 2</b>');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 1, end: 4}, 'Matched "div" tag name');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 5, end: 24}, 'Matched full "class" attribute');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 12, end: 23}, 'Matched "class" value');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 12, end: 17}, 'Matched "hello" class name');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 18, end: 23}, 'Matched "world" class name');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 25, end: 28}, 'Matched full "b" attribute');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 27, end: 28}, 'Matched "b" value');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 41, end: 42}, 'Moved to <b> tag, selected tag name');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 43, end: 56}, 'Matched full "class" attribute of <b> tag');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 50, end: 55}, 'Selected "class" value of <b> tag');
		
		run('select_next_item');
		deepEqual(editorStub.getSelectionRange(), {start: 50, end: 55}, 'No movement');
		
		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 43, end: 56}, 'Selected full "class" attribute of <b> tag (backward)');
		
		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 41, end: 42}, 'Selected <b> tag name (backward)');
		
		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 27, end: 28}, 'Matched "b" value (backward)');
		
		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 25, end: 28}, 'Matched full "b" attribute (backward)');
		
		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 18, end: 23}, 'Matched "world" class name (backward)');

		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 12, end: 17}, 'Matched "hello" class name (backward)');
		
		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 12, end: 23}, 'Matched "class" value (backward)');
		
		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 5, end: 24}, 'Matched full "class" attribute (backward)');
		
		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 1, end: 4}, 'Matched "div" tab name (backward)');
		
		run('select_previous_item');
		deepEqual(editorStub.getSelectionRange(), {start: 1, end: 4}, 'No movement (backward)');
	});
	
	test('Select current line', function() {
		editorStub.replaceContent('Lorem\nipsum dol|or sit\namet');
		run('select_line');
		equal(editorStub.getSelection(), 'ipsum dolor sit', 'Selected line');
	});
	
	test('Split/join current tag', function() {
		editorStub.replaceContent('<span class="|sample"></span>');
		
		run('split_join_tag');
		equal(editorStub.getContent(), '<span class="sample" />', 'Inline tag is joined');
		
		run('split_join_tag');
		equal(editorStub.getContent(), '<span class="sample"></span>', 'Inline tag is splitted');
		
		
		var oldProfile = editorStub.getProfileName();
		editorStub.setProfileName('xml');
		editorStub.replaceContent('<div class="|sample"></div>');
		
		run('split_join_tag');
		equal(editorStub.getContent(), '<div class="sample"/>', 'XML tag is joined');
		
		run('split_join_tag');
		equal(editorStub.getContent(), '<div class="sample">\n\t\n</div>', 'XML tag is splitted');
		editorStub.setProfileName(oldProfile);
	});

	test('Toggle comment (HTML)', function() {
		editorStub.replaceContent('hello <sp|an>world</span>');
		
		run('toggle_comment');
		equal(editorStub.getContent(), 'hello <!-- <span>world</span> -->', 'Added comment to <span> element');
		
		editorStub.setCaretPos(12);
		run('toggle_comment');
		equal(editorStub.getContent(), 'hello <span>world</span>', 'Removed comment from <span> element');
	});
	
	test('Toggle comment (CSS)', function() {
		editorStub.setSyntax('css');
		editorStub.replaceContent('a {color: red; font-weight:| bold;} b {color: black;}');
		
		run('toggle_comment');
		equal(editorStub.getContent(), 'a {color: red; /* font-weight: bold; */} b {color: black;}', 'Added comment to font-weight property');
		
		editorStub.setCaretPos(18);
		run('toggle_comment');
		equal(editorStub.getContent(), 'a {color: red; font-weight: bold;} b {color: black;}', 'Removed comment from font-weight property');
		
		editorStub.setCaretPos(1);
		run('toggle_comment');
		equal(editorStub.getContent(), '/* a {color: red; font-weight: bold;} */ b {color: black;}', 'Commented full "a" rule');
		
		editorStub.setSyntax('html');
	});
	
	test('Update image size (HTML)', function() {
		editorStub.replaceContent('<img| src="data:image/gif;base64,R0lGODlhAwACAHAAACH5BAUAAAAALAAAAAADAAIAQAIChF8AOw==" alt="" />');
		run('update_image_size');
		equal(editorStub.getContent(), '<img src="data:image/gif;base64,R0lGODlhAwACAHAAACH5BAUAAAAALAAAAAADAAIAQAIChF8AOw==" alt="" width="3" height="2" />', 'Added "width" and "height" attributes into <img> tag');
		
		editorStub.replaceContent('<img| src="data:image/gif;base64,R0lGODlhAwACAHAAACH5BAUAAAAALAAAAAADAAIAQAIChF8AOw==" width="100" height="100" alt="" />');
		run('update_image_size');
		equal(editorStub.getContent(), '<img src="data:image/gif;base64,R0lGODlhAwACAHAAACH5BAUAAAAALAAAAAADAAIAQAIChF8AOw==" width="3" height="2" alt="" />', 'Updated existing attributes');
		
		editorStub.replaceContent('<img| src="data:image/gif;base64,R0lGODlhAwACAHAAACH5BAUAAAAALAAAAAADAAIAQAIChF8AOw==" width="100" alt="" />');
		run('update_image_size');
		equal(editorStub.getContent(), '<img src="data:image/gif;base64,R0lGODlhAwACAHAAACH5BAUAAAAALAAAAAADAAIAQAIChF8AOw==" width="3" height="2" alt="" />', 'Updated "width" attribute and added "height" attribute');
	});
	
	test('Update image size (CSS)', function() {
		editorStub.setSyntax('css');
		
		editorStub.replaceContent('.test {\n\tbackgrou|nd: url(data:image/gif;base64,R0lGODlhAwACAHAAACH5BAUAAAAALAAAAAADAAIAQAIChF8AOw==);\n}');
		run('update_image_size');
		equal(editorStub.getContent(), '.test {\n\tbackground: url(data:image/gif;base64,R0lGODlhAwACAHAAACH5BAUAAAAALAAAAAADAAIAQAIChF8AOw==);\n\twidth: 3px;\n\theight: 2px;\n}', 'Added "width" and "height" properties');
		
		editorStub.replaceContent('.test {\n\tbackgrou|nd: url(data:image/gif;base64,R0lGODlhAwACAHAAACH5BAUAAAAALAAAAAADAAIAQAIChF8AOw==);\n\twidth: 100px;\n\theight: 100px;\n}');
		run('update_image_size');
		equal(editorStub.getContent(), '.test {\n\tbackground: url(data:image/gif;base64,R0lGODlhAwACAHAAACH5BAUAAAAALAAAAAADAAIAQAIChF8AOw==);\n\twidth: 3px;\n\theight: 2px;\n}', 'Updated "width" and "height" properties');
		
		editorStub.replaceContent('.test {\n\tbackgrou|nd: url(data:image/gif;base64,R0lGODlhAwACAHAAACH5BAUAAAAALAAAAAADAAIAQAIChF8AOw==);\n\twidth: 100px;\n}');
		run('update_image_size');
		equal(editorStub.getContent(), '.test {\n\tbackground: url(data:image/gif;base64,R0lGODlhAwACAHAAACH5BAUAAAAALAAAAAADAAIAQAIChF8AOw==);\n\twidth: 3px;\n\theight: 2px;\n}', 'Updated "width" property and added "height"');
		
		editorStub.setSyntax('html');
	});
	
	test('Wrap With Abbreviation', function() {
		editorStub.replaceContent('<br| />');
		editorStub.setPromptOutput('ul>li');
		run('wrap_with_abbreviation');
		equal(editorStub.getContent(), '<ul>\n\t<li>\n\t\t<br />\n\t</li>\n</ul>', 'Wrapped with `ul>li`');
		
		editorStub.replaceContent('one\ntwo\nthree');
		editorStub.createSelection(0, 13);
		editorStub.setPromptOutput('ul>li.i$*');
		run('wrap_with_abbreviation');
		equal(editorStub.getContent(), '<ul>\n\t<li class="i1">one</li>\n\t<li class="i2">two</li>\n\t<li class="i3">three</li>\n</ul>', 'Wrapped multiline abbreviation');
		
	});
})();