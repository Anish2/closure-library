// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.dom.RangeTest');
goog.setTestOnly('goog.dom.RangeTest');

goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.Range');
goog.require('goog.dom.RangeType');
goog.require('goog.dom.TagName');
goog.require('goog.dom.TextRange');
goog.require('goog.dom.browserrange');
goog.require('goog.testing.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var assertRangeEquals = goog.testing.dom.assertRangeEquals;

function setUp() {
  // Reset the focus; some tests may invalidate the focus to exercise various
  // browser bugs.
  var focusableElement = goog.dom.getElement('focusableElement');
  focusableElement.focus();
  focusableElement.blur();
}

function normalizeHtml(str) {
  return str.toLowerCase().replace(/[\n\r\f"]/g, '')
      .replace(/<\/li>/g, ''); // " for emacs
}

function testCreate() {
  assertNotNull('Browser range object can be created for node',
      goog.dom.Range.createFromNodeContents(goog.dom.getElement('test1')));
}

function testTableRange() {
  var tr = goog.dom.getElement('cell').parentNode;
  var range = goog.dom.Range.createFromNodeContents(tr);
  assertEquals('Selection should have correct text', '12',
      range.getText());
  assertEquals('Selection should have correct html fragment',
      '1</td><td>2', normalizeHtml(range.getHtmlFragment()));

  // TODO(robbyw): On IE the TR is included, on FF it is not.
  //assertEquals('Selection should have correct valid html',
  //    '<tr id=row><td>1</td><td>2</td></tr>',
  //    normalizeHtml(range.getValidHtml()));

  assertEquals('Selection should have correct pastable html',
      '<table><tbody><tr><td id=cell>1</td><td>2</td></tr></tbody></table>',
      normalizeHtml(range.getPastableHtml()));
}

function testUnorderedListRange() {
  var ul = goog.dom.getElement('ulTest').firstChild;
  var range = goog.dom.Range.createFromNodeContents(ul);
  assertEquals('Selection should have correct html fragment',
      '1<li>2', normalizeHtml(range.getHtmlFragment()));

  // TODO(robbyw): On IE the UL is included, on FF it is not.
  //assertEquals('Selection should have correct valid html',
  //    '<li>1</li><li>2</li>', normalizeHtml(range.getValidHtml()));

  assertEquals('Selection should have correct pastable html',
      '<ul><li>1<li>2</ul>',
      normalizeHtml(range.getPastableHtml()));
}

function testOrderedListRange() {
  var ol = goog.dom.getElement('olTest').firstChild;
  var range = goog.dom.Range.createFromNodeContents(ol);
  assertEquals('Selection should have correct html fragment',
      '1<li>2', normalizeHtml(range.getHtmlFragment()));

  // TODO(robbyw): On IE the OL is included, on FF it is not.
  //assertEquals('Selection should have correct valid html',
  //    '<li>1</li><li>2</li>', normalizeHtml(range.getValidHtml()));

  assertEquals('Selection should have correct pastable html',
      '<ol><li>1<li>2</ol>',
      normalizeHtml(range.getPastableHtml()));
}

function testCreateFromNodes() {
  var start = goog.dom.getElement('test1').firstChild;
  var end = goog.dom.getElement('br');
  var range = goog.dom.Range.createFromNodes(start, 2, end, 0);
  assertNotNull('Browser range object can be created for W3C node range',
      range);

  assertEquals('Start node should be selected at start endpoint', start,
      range.getStartNode());
  assertEquals('Selection should start at offset 2', 2,
      range.getStartOffset());
  assertEquals('Start node should be selected at anchor endpoint', start,
      range.getAnchorNode());
  assertEquals('Selection should be anchored at offset 2', 2,
      range.getAnchorOffset());

  var div = goog.dom.getElement('test2');
  assertEquals('DIV node should be selected at end endpoint', div,
      range.getEndNode());
  assertEquals('Selection should end at offset 1', 1, range.getEndOffset());
  assertEquals('DIV node should be selected at focus endpoint', div,
      range.getFocusNode());
  assertEquals('Selection should be focused at offset 1', 1,
      range.getFocusOffset());


  assertTrue('Text content should be "xt\\s*abc"',
      /xt\s*abc/.test(range.getText()));
  assertFalse('Nodes range is not collapsed', range.isCollapsed());
}


function testCreateControlRange() {
  if (!goog.userAgent.IE) {
    return;
  }
  var cr = document.body.createControlRange();
  cr.addElement(goog.dom.getElement('logo'));

  var range = goog.dom.Range.createFromBrowserRange(cr);
  assertNotNull('Control range object can be created from browser range',
      range);
  assertEquals('Created range is a control range', goog.dom.RangeType.CONTROL,
      range.getType());
}


function testTextNode() {
  var range = goog.dom.Range.createFromNodeContents(
      goog.dom.getElement('test1').firstChild);

  assertEquals('Created range is a text range', goog.dom.RangeType.TEXT,
      range.getType());
  assertEquals('Text node should be selected at start endpoint', 'Text',
      range.getStartNode().nodeValue);
  assertEquals('Selection should start at offset 0', 0,
      range.getStartOffset());

  assertEquals('Text node should be selected at end endpoint', 'Text',
      range.getEndNode().nodeValue);
  assertEquals('Selection should end at offset 4', 'Text'.length,
      range.getEndOffset());

  assertEquals('Container should be text node', goog.dom.NodeType.TEXT,
      range.getContainer().nodeType);

  assertEquals('Text content should be "Text"', 'Text', range.getText());
  assertFalse('Text range is not collapsed', range.isCollapsed());
}


function testDiv() {
  var range = goog.dom.Range.createFromNodeContents(
      goog.dom.getElement('test2'));

  assertEquals('Text node "abc" should be selected at start endpoint', 'abc',
      range.getStartNode().nodeValue);
  assertEquals('Selection should start at offset 0', 0,
      range.getStartOffset());

  assertEquals('Text node "def" should be selected at end endpoint', 'def',
      range.getEndNode().nodeValue);
  assertEquals('Selection should end at offset 3', 'def'.length,
      range.getEndOffset());

  assertEquals('Container should be DIV', goog.dom.getElement('test2'),
      range.getContainer());

  assertTrue('Div text content should be "abc\\s*def"',
      /abc\s*def/.test(range.getText()));
  assertFalse('Div range is not collapsed', range.isCollapsed());
}


function testEmptyNode() {
  var range = goog.dom.Range.createFromNodeContents(
      goog.dom.getElement('empty'));

  assertEquals('DIV be selected at start endpoint',
      goog.dom.getElement('empty'), range.getStartNode());
  assertEquals('Selection should start at offset 0', 0,
      range.getStartOffset());

  assertEquals('DIV should be selected at end endpoint',
      goog.dom.getElement('empty'), range.getEndNode());
  assertEquals('Selection should end at offset 0', 0,
      range.getEndOffset());

  assertEquals('Container should be DIV', goog.dom.getElement('empty'),
      range.getContainer());

  assertEquals('Empty text content should be ""', '', range.getText());
  assertTrue('Empty range is collapsed', range.isCollapsed());
}


function testCollapse() {
  var range = goog.dom.Range.createFromNodeContents(
      goog.dom.getElement('test2'));
  assertFalse('Div range is not collapsed', range.isCollapsed());
  range.collapse();
  assertTrue('Div range is collapsed after call to empty()',
      range.isCollapsed());

  range = goog.dom.Range.createFromNodeContents(goog.dom.getElement('empty'));
  assertTrue('Empty range is collapsed', range.isCollapsed());
  range.collapse();
  assertTrue('Empty range is still collapsed', range.isCollapsed());
}

// TODO(robbyw): Test iteration over a strange document fragment.

function testIterator() {
  goog.testing.dom.assertNodesMatch(goog.dom.Range.createFromNodeContents(
      goog.dom.getElement('test2')), ['abc', '#br', '#br', 'def']);
}

function testReversedNodes() {
  var node = goog.dom.getElement('test1').firstChild;
  var range = goog.dom.Range.createFromNodes(node, 4, node, 0);
  assertTrue('Range is reversed', range.isReversed());
  node = goog.dom.getElement('test3');
  range = goog.dom.Range.createFromNodes(node, 0, node, 1);
  assertFalse('Range is not reversed', range.isReversed());
}

function testReversedContents() {
  var range = goog.dom.Range.createFromNodeContents(
      goog.dom.getElement('test1'), true);
  assertTrue('Range is reversed', range.isReversed());
  assertEquals('Range should select "Text"', 'Text',
      range.getText());
  assertEquals('Range start offset should be 0', 0, range.getStartOffset());
  assertEquals('Range end offset should be 4', 4, range.getEndOffset());
  assertEquals('Range anchor offset should be 4', 4, range.getAnchorOffset());
  assertEquals('Range focus offset should be 0', 0, range.getFocusOffset());

  var range2 = range.clone();

  range.collapse(true);
  assertTrue('Range is collapsed', range.isCollapsed());
  assertFalse('Collapsed range is not reversed', range.isReversed());
  assertEquals('Post collapse start offset should be 4', 4,
      range.getStartOffset());

  range2.collapse(false);
  assertTrue('Range 2 is collapsed', range2.isCollapsed());
  assertFalse('Collapsed range 2 is not reversed', range2.isReversed());
  assertEquals('Post collapse start offset 2 should be 0', 0,
      range2.getStartOffset());
}

function testRemoveContents() {
  var outer = goog.dom.getElement('removeTest');
  var range = goog.dom.Range.createFromNodeContents(outer.firstChild);

  range.removeContents();

  assertEquals('Removed range content should be ""', '', range.getText());
  assertTrue('Removed range should be collapsed', range.isCollapsed());
  assertEquals('Outer div should have 1 child now', 1,
      outer.childNodes.length);
  assertEquals('Inner div should be empty', 0,
      outer.firstChild.childNodes.length);
}

function testRemovePartialContents() {
  var outer = goog.dom.getElement('removePartialTest');
  var originalText = goog.dom.getTextContent(outer);

  try {
    var range = goog.dom.Range.createFromNodes(outer.firstChild, 2,
        outer.firstChild, 4);
    removeHelper(1, range, outer, 1, '0145');

    range = goog.dom.Range.createFromNodes(outer.firstChild, 0,
        outer.firstChild, 1);
    removeHelper(2, range, outer, 1, '145');

    range = goog.dom.Range.createFromNodes(outer.firstChild, 2,
        outer.firstChild, 3);
    removeHelper(3, range, outer, 1, '14');

    var br = goog.dom.createDom(goog.dom.TagName.BR);
    outer.appendChild(br);
    range = goog.dom.Range.createFromNodes(outer.firstChild, 1,
        outer, 1);
    removeHelper(4, range, outer, 2, '1<br>');

    outer.innerHTML = '<br>123';
    range = goog.dom.Range.createFromNodes(outer, 0, outer.lastChild, 2);
    removeHelper(5, range, outer, 1, '3');

    outer.innerHTML = '123<br>456';
    range = goog.dom.Range.createFromNodes(outer.firstChild, 1, outer.lastChild,
        2);
    removeHelper(6, range, outer, 2, '16');

    outer.innerHTML = '123<br>456';
    range = goog.dom.Range.createFromNodes(outer.firstChild, 0, outer.lastChild,
        2);
    removeHelper(7, range, outer, 1, '6');

    outer.innerHTML = '<div></div>';
    range = goog.dom.Range.createFromNodeContents(outer.firstChild);
    removeHelper(8, range, outer, 1, '<div></div>');
  } finally {
    // Restore the original text state for repeated runs.
    goog.dom.setTextContent(outer, originalText);
  }

  // TODO(robbyw): Fix the following edge cases:
  //    * Selecting contents of a node containing multiply empty divs
  //    * Selecting via createFromNodes(x, 0, x, x.childNodes.length)
  //    * Consistent handling of nodeContents(<div><div></div></div>).remove
}

function removeHelper(testNumber, range, outer, expectedChildCount,
    expectedContent) {
  range.removeContents();
  assertTrue(testNumber + ': Removed range should now be collapsed',
      range.isCollapsed());
  assertEquals(testNumber + ': Removed range content should be ""', '',
      range.getText());
  assertEquals(testNumber + ': Outer div should contain correct text',
      expectedContent, outer.innerHTML.toLowerCase());
  assertEquals(testNumber + ': Outer div should have ' + expectedChildCount +
      ' children now', expectedChildCount, outer.childNodes.length);
  assertNotNull(testNumber + ': Empty node should still exist',
      goog.dom.getElement('empty'));
}

function testSurroundContents() {
  var outer = goog.dom.getElement('surroundTest');
  outer.innerHTML = '---Text that<br>will be surrounded---';
  var range = goog.dom.Range.createFromNodes(outer.firstChild, 3,
      outer.lastChild, outer.lastChild.nodeValue.length - 3);

  var div = goog.dom.createDom(goog.dom.TagName.DIV, {'style': 'color: red'});
  var output = range.surroundContents(div);

  assertEquals('Outer element should contain new element', outer,
      output.parentNode);
  assertFalse('New element should have no id', !!output.id);
  assertEquals('New element should be red', 'red', output.style.color);
  assertEquals('Outer element should have three children', 3,
      outer.childNodes.length);
  assertEquals('New element should have three children', 3,
      output.childNodes.length);

  // TODO(robbyw): Ensure the range stays in a reasonable state.
}


/**
 * Given two offsets into the 'foobar' node, make sure that inserting
 * nodes at those offsets doesn't change a selection of 'oba'.
 * @bug 1480638
 */
function assertSurroundDoesntChangeSelectionWithOffsets(
    offset1, offset2, expectedHtml) {
  var div = goog.dom.getElement('bug1480638');
  div.innerHTML = 'foobar';
  var rangeToSelect = goog.dom.Range.createFromNodes(
      div.firstChild, 2, div.firstChild, 5);
  rangeToSelect.select();

  var rangeToSurround = goog.dom.Range.createFromNodes(
      div.firstChild, offset1, div.firstChild, offset2);
  rangeToSurround.surroundWithNodes(goog.dom.createDom(goog.dom.TagName.SPAN),
      goog.dom.createDom(goog.dom.TagName.SPAN));

  // Make sure that the selection didn't change.
  assertHTMLEquals('Selection must not change when contents are surrounded.',
      expectedHtml, goog.dom.Range.createFromWindow().getHtmlFragment());
}

function testSurroundWithNodesDoesntChangeSelection1() {
  assertSurroundDoesntChangeSelectionWithOffsets(3, 4,
      'o<span></span>b<span></span>a');
}

function testSurroundWithNodesDoesntChangeSelection2() {
  assertSurroundDoesntChangeSelectionWithOffsets(3, 6,
      'o<span></span>ba');
}

function testSurroundWithNodesDoesntChangeSelection3() {
  assertSurroundDoesntChangeSelectionWithOffsets(1, 3,
      'o<span></span>ba');
}

function testSurroundWithNodesDoesntChangeSelection4() {
  assertSurroundDoesntChangeSelectionWithOffsets(1, 6,
      'oba');
}

function testInsertNode() {
  var outer = goog.dom.getElement('insertTest');
  outer.innerHTML = 'ACD';

  var range = goog.dom.Range.createFromNodes(outer.firstChild, 1,
      outer.firstChild, 2);
  range.insertNode(goog.dom.createTextNode('B'), true);
  assertEquals('Element should have correct innerHTML', 'ABCD',
      outer.innerHTML);

  outer.innerHTML = '12';
  range = goog.dom.Range.createFromNodes(outer.firstChild, 0,
      outer.firstChild, 1);
  var br = range.insertNode(goog.dom.createDom(goog.dom.TagName.BR), false);
  assertEquals('New element should have correct innerHTML', '1<br>2',
      outer.innerHTML.toLowerCase());
  assertEquals('BR should be in outer', outer, br.parentNode);
}

function testReplaceContentsWithNode() {
  var outer = goog.dom.getElement('insertTest');
  outer.innerHTML = 'AXC';

  var range = goog.dom.Range.createFromNodes(outer.firstChild, 1,
      outer.firstChild, 2);
  range.replaceContentsWithNode(goog.dom.createTextNode('B'));
  assertEquals('Element should have correct innerHTML', 'ABC',
      outer.innerHTML);

  outer.innerHTML = 'ABC';
  range = goog.dom.Range.createFromNodes(outer.firstChild, 3,
      outer.firstChild, 3);
  range.replaceContentsWithNode(goog.dom.createTextNode('D'));
  assertEquals(
      'Element should have correct innerHTML after collapsed replace',
      'ABCD', outer.innerHTML);

  outer.innerHTML = 'AX<b>X</b>XC';
  range = goog.dom.Range.createFromNodes(outer.firstChild, 1,
      outer.lastChild, 1);
  range.replaceContentsWithNode(goog.dom.createTextNode('B'));
  goog.testing.dom.assertHtmlContentsMatch('ABC', outer);
}

function testSurroundWithNodes() {
  var outer = goog.dom.getElement('insertTest');
  outer.innerHTML = 'ACE';
  var range = goog.dom.Range.createFromNodes(outer.firstChild, 1,
      outer.firstChild, 2);

  range.surroundWithNodes(goog.dom.createTextNode('B'),
      goog.dom.createTextNode('D'));

  assertEquals('New element should have correct innerHTML', 'ABCDE',
      outer.innerHTML);
}

function testIsRangeInDocument() {
  var outer = goog.dom.getElement('insertTest');
  outer.innerHTML = '<br>ABC';
  var range = goog.dom.Range.createCaret(outer.lastChild, 1);

  assertEquals('Should get correct start element', 'ABC',
      range.getStartNode().nodeValue);
  assertTrue('Should be considered in document', range.isRangeInDocument());

  outer.innerHTML = 'DEF';

  assertFalse('Should be marked as out of document',
      range.isRangeInDocument());
}

function testRemovedNode() {
  var node = goog.dom.getElement('removeNodeTest');
  var range = goog.dom.browserrange.createRangeFromNodeContents(node);
  range.select();
  goog.dom.removeNode(node);

  var newRange = goog.dom.Range.createFromWindow(window);

  // In Chrome 14 and below (<= Webkit 535.1), newRange will be null.
  // In Chrome 16 and above (>= Webkit 535.7), newRange will be collapsed
  // like on other browsers.
  // We didn't bother testing in between.
  if (goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('535.7')) {
    assertNull('Webkit supports rangeCount == 0', newRange);
  } else {
    assertTrue('The other browsers will just have an empty range.',
        newRange.isCollapsed());
  }
}

function testReversedRange() {
  if (goog.userAgent.EDGE_OR_IE) return; // IE doesn't make this distinction.

  goog.dom.Range.createFromNodes(goog.dom.getElement('test2'), 0,
      goog.dom.getElement('test1'), 0).select();

  var range = goog.dom.Range.createFromWindow(window);
  assertTrue('Range should be reversed', range.isReversed());
}

function testUnreversedRange() {
  goog.dom.Range.createFromNodes(goog.dom.getElement('test1'), 0,
      goog.dom.getElement('test2'), 0).select();

  var range = goog.dom.Range.createFromWindow(window);
  assertFalse('Range should not be reversed', range.isReversed());
}

function testReversedThenUnreversedRange() {
  // This tests a workaround for a webkit bug where webkit caches selections
  // incorrectly.
  goog.dom.Range.createFromNodes(goog.dom.getElement('test2'), 0,
      goog.dom.getElement('test1'), 0).select();
  goog.dom.Range.createFromNodes(goog.dom.getElement('test1'), 0,
      goog.dom.getElement('test2'), 0).select();

  var range = goog.dom.Range.createFromWindow(window);
  assertFalse('Range should not be reversed', range.isReversed());
}

function testHasAndClearSelection() {
  goog.dom.Range.createFromNodeContents(
      goog.dom.getElement('test1')).select();

  assertTrue('Selection should exist', goog.dom.Range.hasSelection());

  goog.dom.Range.clearSelection();

  assertFalse('Selection should not exist', goog.dom.Range.hasSelection());
}

function assertForward(string, startNode, startOffset, endNode, endOffset) {
  var root = goog.dom.getElement('test2');
  var originalInnerHtml = root.innerHTML;

  assertFalse(string, goog.dom.Range.isReversed(startNode, startOffset,
      endNode, endOffset));
  assertTrue(string, goog.dom.Range.isReversed(endNode, endOffset,
      startNode, startOffset));
  assertEquals('Contents should be unaffected after: ' + string,
      root.innerHTML, originalInnerHtml);
}

function testIsReversed() {
  var root = goog.dom.getElement('test2');
  var text1 = root.firstChild; // Text content: 'abc'.
  var br = root.childNodes[1];
  var text2 = root.lastChild; // Text content: 'def'.

  assertFalse('Same element position gives false', goog.dom.Range.isReversed(
      root, 0, root, 0));
  assertFalse('Same text position gives false', goog.dom.Range.isReversed(
      text1, 0, text2, 0));
  assertForward('Element offsets should compare against each other',
      root, 0, root, 2);
  assertForward('Text node offsets should compare against each other',
      text1, 0, text2, 2);
  assertForward('Text nodes should compare correctly',
      text1, 0, text2, 0);
  assertForward('Text nodes should compare to later elements',
      text1, 0, br, 0);
  assertForward('Text nodes should compare to earlier elements',
      br, 0, text2, 0);
  assertForward('Parent is before element child', root, 0, br, 0);
  assertForward('Parent is before text child', root, 0, text1, 0);
  assertFalse('Equivalent position gives false', goog.dom.Range.isReversed(
      root, 0, text1, 0));
  assertFalse('Equivalent position gives false', goog.dom.Range.isReversed(
      root, 1, br, 0));
  assertForward('End of element is after children', text1, 0, root, 3);
  assertForward('End of element is after children', br, 0, root, 3);
  assertForward('End of element is after children', text2, 0, root, 3);
  assertForward('End of element is after end of last child',
      text2, 3, root, 3);
}

function testSelectAroundSpaces() {
  // set the selection
  var textNode = goog.dom.getElement('textWithSpaces').firstChild;
  goog.dom.TextRange.createFromNodes(
      textNode, 5, textNode, 12).select();

  // get the selection and check that it matches what we set it to
  var range = goog.dom.Range.createFromWindow();
  assertEquals(' world ', range.getText());
  assertEquals(5, range.getStartOffset());
  assertEquals(12, range.getEndOffset());
  assertEquals(textNode, range.getContainer());

  // Check the contents again, because there used to be a bug where
  // it changed after calling getContainer().
  assertEquals(' world ', range.getText());
}

function testSelectInsideSpaces() {
  // set the selection
  var textNode = goog.dom.getElement('textWithSpaces').firstChild;
  goog.dom.TextRange.createFromNodes(
      textNode, 6, textNode, 11).select();

  // get the selection and check that it matches what we set it to
  var range = goog.dom.Range.createFromWindow();
  assertEquals('world', range.getText());
  assertEquals(6, range.getStartOffset());
  assertEquals(11, range.getEndOffset());
  assertEquals(textNode, range.getContainer());

  // Check the contents again, because there used to be a bug where
  // it changed after calling getContainer().
  assertEquals('world', range.getText());
}

function testRangeBeforeBreak() {
  var container = goog.dom.getElement('rangeAroundBreaks');
  var text = container.firstChild;
  var offset = text.length;
  assertEquals(4, offset);

  var br = container.childNodes[1];
  var caret = goog.dom.Range.createCaret(text, offset);
  caret.select();
  assertEquals(offset, caret.getStartOffset());

  var range = goog.dom.Range.createFromWindow();
  assertFalse('Should not contain whole <br>',
      range.containsNode(br, false));
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    assertTrue('Range over <br> is adjacent to the immediate range before it',
        range.containsNode(br, true));
  } else {
    assertFalse('Should not contain partial <br>',
        range.containsNode(br, true));
  }

  assertEquals(offset, range.getStartOffset());
  assertEquals(text, range.getStartNode());
}

function testRangeAfterBreak() {
  var container = goog.dom.getElement('rangeAroundBreaks');
  var br = container.childNodes[1];
  var caret = goog.dom.Range.createCaret(container.lastChild, 0);
  caret.select();
  assertEquals(0, caret.getStartOffset());

  var range = goog.dom.Range.createFromWindow();
  assertFalse('Should not contain whole <br>',
      range.containsNode(br, false));
  var isSafari3 =
      goog.userAgent.WEBKIT && !goog.userAgent.isVersionOrHigher('528');

  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9) ||
      isSafari3) {
    assertTrue('Range over <br> is adjacent to the immediate range after it',
        range.containsNode(br, true));
  } else {
    assertFalse('Should not contain partial <br>',
        range.containsNode(br, true));
  }

  if (isSafari3) {
    assertEquals(2, range.getStartOffset());
    assertEquals(container, range.getStartNode());
  } else {
    assertEquals(0, range.getStartOffset());
    assertEquals(container.lastChild, range.getStartNode());
  }
}

function testRangeAtBreakAtStart() {
  var container = goog.dom.getElement('breaksAroundNode');
  var br = container.firstChild;
  var caret = goog.dom.Range.createCaret(container.firstChild, 0);
  caret.select();
  assertEquals(0, caret.getStartOffset());

  var range = goog.dom.Range.createFromWindow();
  assertTrue('Range over <br> is adjacent to the immediate range before it',
      range.containsNode(br, true));
  assertFalse('Should not contain whole <br>',
      range.containsNode(br, false));

  assertRangeEquals(container, 0, container, 0, range);
}

function testFocusedElementDisappears() {
  // This reproduces a failure case specific to Gecko, where an element is
  // created, contentEditable is set, is focused, and removed.  After that
  // happens, calling selection.collapse fails.
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773137
  var disappearingElement = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(disappearingElement);
  disappearingElement.contentEditable = true;
  disappearingElement.focus();
  document.body.removeChild(disappearingElement);
  var container = goog.dom.getElement('empty');
  var caret = goog.dom.Range.createCaret(container, 0);
  // This should not throw.
  caret.select();
  assertEquals(0, caret.getStartOffset());
}

function assertNodeEquals(expected, actual) {
  assertEquals(
      'Expected: ' + goog.testing.dom.exposeNode(expected) +
      '\nActual: ' + goog.testing.dom.exposeNode(actual),
      expected, actual);
}
