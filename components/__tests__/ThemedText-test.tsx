import * as React from 'react';
import renderer, { act } from 'react-test-renderer';

import { ThemedText } from '../ThemedText';

it(`renders correctly`, async () => {
  let tree: renderer.ReactTestRenderer | undefined;
  // React 19's test renderer renders asynchronously; flush inside act().
  await act(async () => {
    tree = renderer.create(<ThemedText>Snapshot test!</ThemedText>);
  });

  expect(tree!.toJSON()).toMatchSnapshot();
});

it(`keeps the theme color when a style without color is passed`, async () => {
  let tree: renderer.ReactTestRenderer | undefined;
  await act(async () => {
    tree = renderer.create(<ThemedText style={{ fontSize: 20 }}>Styled</ThemedText>);
  });

  const json = tree!.toJSON() as renderer.ReactTestRendererJSON;
  const flat = Object.assign({}, ...[json.props.style].flat(Infinity).filter(Boolean));
  expect(flat.color).toBe('#11181C');
  expect(flat.fontSize).toBe(20);
});
