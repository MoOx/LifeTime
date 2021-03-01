type callback2<'input, 'input2, 'output> = ('input, 'input2) => 'output

@module("react")
external useCallback21: (
  @uncurry ('input, 'input2) => 'output,
  array<'a>,
) => callback2<'input, 'input2, 'output> = "useCallback"

@module("react")
external useCallback22: (
  @uncurry ('input, 'input2) => 'output,
  ('a, 'b),
) => callback2<'input, 'input2, 'output> = "useCallback"
