var start = 800;

$(document).ready(function() {

    setTimeout(function() {
	$("#exo-text").typedText('Exo - Outside',"fast")}, start);
    
    setTimeout(function() {
	$("#exo-text-1").typedText('Exoplanet - A planet outside the solar system',"fast")}, start);
    
    setTimeout(function() {
	$("#exo-text-2").typedText('KaonPlaneteer - Entity assigned the mission to uplift exoplanets and nurture civilization',"fast")}, start);
		
    setTimeout(function() {
	$("#planet-text").typedText('The Galactic Confederation has offered you the rank of KaonPlaneteer.',"fast")}, start);
    
    setTimeout(function() {
	$("#planet-text-2").typedText('Your mission is to uplift undeveloped exoplanets.',"fast")}, start += 6100);

    setTimeout(function() {
	$("#planet-text-3").typedText('To nurture civilizations to produce the precious galactic crypto commodity: ',"fast")}, start += 5000);

    setTimeout(function() {
	$("#planet-text-5").typedText('Tritanium-44.',"fast")}, start += 5000);

    setTimeout(function() {
	$("#planet-text-6").typedText('The growth of your civilizations will not be smooth.',"fast")}, start += 2500);

    setTimeout(function() {
	$("#planet-text-7").typedText('They will face many challenges you must help them overcome.',"fast")}, start += 5000);

    setTimeout(function() {
	$("#planet-text-8").typedText('Regretably, you may have to liquidate those that become non-productive or insolent.',"fast")}, start += 5500);
	
    setTimeout(function() {
	$("#planet-text-9").typedText('Do you accept the assignment?',"fast")}, start += 7000);

   setTimeout(function() {
        $("#gen-planet-btn2").css("opacity", 1)
   }, start += 4000);

});
