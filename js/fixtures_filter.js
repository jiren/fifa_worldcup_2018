//https://raw.githubusercontent.com/openfootball/world-cup.json/master/2018/worldcup.json
// https://github.com/openfootball/world-cup.json/blob/master/2018/worldcup.standings.json

var DATA = { matches: [], groups: {} };
var TemplateBuilder = FilterJS.templateBuilder;

function renderGroups(){
  var groups = ["A", "B", "C", "D", "E", "F", "G", "H"];
  var tmplFn = TemplateBuilder($("#group-template").html());
  var container = $("#group-filter");

  groups.forEach(function(name){
    container.append(tmplFn({ name: name }));
  });

  $.getJSON(
    'https://raw.githubusercontent.com/openfootball/world-cup.json/master/2018/worldcup.standings.json',
    function(response){
      var teams = [];

      response.groups.forEach(function(group){
        group.standings.forEach(function(team){
          team.group = group.name.replace("Group ", "");
          teams.push(team);
        })
      });

      DATA.teams = teams.sort(function(a, b) { return a.team.name > b.team.name});
      var tmplFn = TemplateBuilder($("#team-template").html());
      var container = $("#teams-filter");

      DATA.teams.forEach(function(team){
        DATA.groups[team.team.code] = team.group;
        container.append(tmplFn(team));
      });

      renderMatches();
   });
}

function renderMatches(){
  var tmplFn = TemplateBuilder($("#match-template").html());
  var container = $("#matches");
  var Filter;

  $.getJSON(
    'https://raw.githubusercontent.com/openfootball/world-cup.json/master/2018/worldcup.json',
    function(response){
      response.rounds.forEach(function(round){
        round.matches.forEach(function(match){
          match.matchday = round.name;
          match.codes = [];

          if(match.team1){
            match.codes.push(match.team1.code);
          }

          if(match.team2){
            match.codes.push(match.team2.code);
          }

          if(match.matchday && match.matchday.startsWith('Matchday')){
            match.group = DATA.groups[match.team1.code];
          }else{
            match.group = match.matchday;
          }

          var timezone = match.timezone.replace('UTC+', '');
          timezone = "+" + ("00" + timezone).slice(-2) + ":00";
          match.date_time = moment(match.date + " " + match.time + " " + timezone, "YYYY-MM-DD HH:mm Z");
          DATA.matches.push(match);
        })
      });

      Filter = FilterJS(DATA.matches, '#matches', { template: '#match-template'})
      Filter.addCriteria({field: 'codes', ele: '#teams-filter input:checkbox'})
      Filter.addCriteria({field: 'group', ele: '#group-filter input:radio', all: "all"})
    }
  )
}

$(document).ready(function(){
  renderGroups();
  // renderTeams();
});

