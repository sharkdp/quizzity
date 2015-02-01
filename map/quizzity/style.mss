@water: #4576b2;
@land: #ffffff;
@border: #000;
@provinceBorder: #777;

Map {
  background-color: @water;
}


#countries {
  ::outline {
    line-color: @border;
    line-width: 0.6;
    line-join: round;
  }

  polygon-fill: @land;

  ::fill {
    polygon-fill: #444;
    comp-op: soft-light;
    image-filters: agg-stack-blur(10, 10);
  }

  [zoom = 2] {
    line-width: 0.1;
  }

  [zoom = 3] {
    line-width: 0.2;
  }

  [zoom = 4] {
    line-width: 0.6;
  }

  [zoom = 5] {
    line-width: 1;
  }
}

#provinces[zoom >= 4] {
  line-color: @provinceBorder;

  [zoom = 4] {
    line-dasharray: 3,2;
    line-width: 0.2;
  }

  [zoom = 5] {
    line-dasharray: 3,2;
    line-width: 0.5;
  }
}
