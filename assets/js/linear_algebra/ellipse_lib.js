function inv_up_triangle(m) {
  let [[a, b], [o, c]] = m;
  return [
      [1/a, -b/a/c],
      [0, 1/c]
  ];
}

function cholesky_U(m) {
  let [[a, b], [b_copy, c]] = m;
  return [
      [Math.sqrt(a), b/Math.sqrt(a)],
      [0, Math.sqrt(c - b*b/a)]
  ];
}


function schur_2_3(v1, v2, v3) {
  let k = v1.z*v1.z + v2.z*v2.z + v3.z*v3.z;
  let l = [
      v1.x*v1.z + v2.x*v2.z + v3.x*v3.z,
      v1.y*v1.z + v2.y*v2.z + v3.y*v3.z,
  ];
  let J = [
    [v1.x*v1.x+v2.x*v2.x+v3.x*v3.x, 
     v1.x*v1.y+v2.x*v2.y+v3.x*v3.y],
    [v1.y*v1.x+v2.y*v2.x+v3.y*v3.x, 
     v1.y*v1.y+v2.y*v2.y+v3.y*v3.y]
  ];
  let S = [
    [J[0][0] - l[0]*l[0]/k, 
     J[0][1] - l[0]*l[1]/k],
    [J[1][0] - l[1]*l[0]/k, 
     J[1][1] - l[1]*l[1]/k]
  ];
  return {
    J: J,
    S: S,
    k: k,
    l: l,
  };
}

function inv_2x2(m) {
  let [[a, b], [c, d]] = m;
  let det = a*d - b*c;
  return [
      [d/det, -b/det],
      [-c/det, a/det]
  ];
}

function matvec(m, v) {
  let [[a, b], [c, d]] = m;
  let [x, y] = v;
  return {x: a*x+b*y, y: c*x+d*y, z:0};
}


function quad_2x2(v, A) {
  let [[a, b], [c, d]] = A;
  let [x, y] = [v.x, v.y];
  return a*x*x + (b+c)*x*y + d*y*y;
}



function create_ring(p1, p2, z_range) {
  let polygons = [];
  let x = 0.5 + 0.5*p1[0].z/z_range;

  if (x <= 0.5) {
    x *= 2*x;
  } else {
    let y = 1-x;
    y *= 2*y;
    x = 1 - y;
    x = 0.5 + (x - 0.5)*0.1;
  }
  
  for (let i = 0; i < p1.length; i++) {
    let j = (i+1)%p1.length;
    let poly =[
        p1[i],
        p2[i],
        p2[j],
        p1[j]
    ];
    poly.color = 'grey';
    poly.opacity = x;
    poly.centroid_z = p1[i].z;
    polygons.push(poly);
  }
  return polygons;
}


function create_circle_points(radius, n=32) {
  let points = [];
  let a = Math.PI * 2 / n;
  for (let i = 1; i <= n; i++) {
    points.push({
        x: Math.cos(a * i) * radius,
        y: Math.sin(a * i) * radius,
        z: 0,
        opacity: 0.2,
        centroid_z: -1000,
    });
  }
  return points;
}


function circle_to_ellipse_shadow_map(v01, v02, v03, radius, n=20) {
  let schur = schur_2_3(v01, v02, v03);
  let U = cholesky_U(schur.S);
  let w = inv_up_triangle(U);

    function shadow_map(v, z=null) {
    let r = Object.assign({}, v);
    r.x = w[0][0] * v.x + w[0][1] * v.y;
    r.y = w[1][0] * v.x + w[1][1] * v.y;
    if (z == null){
      r.z = -(schur.l[0] * r.x + 
              schur.l[1] * r.y) / schur.k;
    } else {
      r.z = z;
    }
    return r;
  }

  let unit_circle = create_circle_points(1.0, 25),
      wU = inv_up_triangle(cholesky_U(schur.J));

  function transform(circle, r, z, dx, dy) {
    let ellipse = [];
    circle.forEach(function(p) {
      ellipse.push({
        x: wU[0][0]*p.x*r + wU[0][1]*p.y*r + dx,
        y: wU[1][0]*p.x*r + wU[1][1]*p.y*r + dy,
        z: z,
      });
    });
    return ellipse;
  }

  let m = matvec(inv_2x2(schur.J), schur.l);
  let y = schur.k - quad_2x2(m, schur.J);
  let z_range = radius/Math.sqrt(y);
  let rad = radius*0.99;

  let pos_half = [], neg_half = [];
  for (let i = 0; i <= n; i++) {
    let z = Math.sqrt(i/n) * z_range, r = 0;
    if (rad*rad > z*z*y) {
      r = Math.sqrt(rad*rad - z*z*y);
    }
    c1 = transform(unit_circle, r, z, -z*m.x, -z*m.y);
    pos_half.push(c1);
    c2 = transform(unit_circle, r, -z, z*m.x, z*m.y);
    neg_half.push(c2);
  }

  function make_surface_polygons(half) {
    let polygons = [];
    for (let i = 0; i < half.length-1; i++) {
      polygons.push(...create_ring(half[i], half[i+1], z_range));
    }
    return polygons;
  }

  surface_polygons = [];
  surface_polygons = make_surface_polygons(pos_half);
  surface_polygons.push(...make_surface_polygons(neg_half));

  return {
    map: function(v) {return shadow_map(v);},
    surface_polygons: surface_polygons,
  };
}