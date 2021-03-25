type ring = {
  startColor: string,
  endColor: string,
  backgroundColor: string,
  progress: float,
}

@module("./ActivityRings.js") @react.component
external make: (
  ~animationDuration: float=?,
  ~backgroundColor: string,
  ~children: React.element=?,
  ~rings: array<ring>,
  ~shadowSolidColor: string=?,
  ~shadowSolidSize: float=?,
  ~spaceBetween: float,
  ~strokeWidth: float,
  ~width: float,
) => React.element = "default"
