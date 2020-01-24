type ring = {
  startColor: string,
  endColor: string,
  backgroundColor: string,
  progress: float,
};

[@bs.module "./ActivityRings.js"] [@react.component]
external make:
  (
    ~rings: array(ring),
    ~width: float,
    ~strokeWidth: float,
    ~spaceBetween: float,
    ~backgroundColor: string,
    ~children: React.element=?
  ) =>
  React.element =
  "default";
