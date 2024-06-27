
#macro Orbit(Radius)
       rotate <0, (-clock*300000/pow(Radius, 2.2)), 0>
#end

#macro OrbitOffset(Radius,Offset)
       rotate <0, (-clock*300000/pow(Radius, 2.2) + mod(Offset,360)), 0>
#end

#macro RotatePlanet(Factor)
   rotate <0, (v_random_float+clock)*Factor, 0>
#end

#macro TransformLocation(Location, Transform)
       vtransform(Location, Transform)
#end
