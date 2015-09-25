Rounds = new Mongo.Collection("rounds");
Scores = new Mongo.Collection("scores");
Times = new Mongo.Collection("times");
Blocked = new Mongo.Collection("blocked");
Red = new Mongo.Collection("red");
Thank = new Mongo.Collection("thank");

if (Meteor.isClient) {
    ty = function(){
        var t=Thank.findOne();
        Thank.update(t._id, {ty: !t.ty});
    }
    
    r = function(p) { //red
        var r= Red.findOne({player:p});
        Red.update(r._id,{player:p,red:true});
    }

    unr = function(p) { //unred
        var r= Red.findOne({player:p});
        Red.update(r._id,{player:p,red:false});
    }

	b = function() { //block
		var b = Blocked.findOne();
		Blocked.update(b._id, {blocked: true});
	}

	unb = function() { //unblok
		var b = Blocked.findOne();
		Blocked.update(b._id, {blocked: false});
	}

	pts = function(p, pts) { //updatepts
		var player = Scores.findOne({player: p});
		Scores.update(player._id, {$inc: {score: pts}});
	}

	reset = function() { //reset 
		times(); b(); unr(1); unr(2); unr(3);
	}

	times = function() { //reset time
		while (Times.find().count() > 0) {
			Times.remove({"_id": Times.findOne()._id});
		}
	}

	loadNames = function(n2, n3) {
		var c = Rounds.findOne({name: "c"});
		Rounds.update(c._id, {$set: {p2: n2, p3: n3}});
	}

	create = function(b) { //create board
        var board = Rounds.findOne({name:b});
        var qs = board.questions;
        var categories = [];
		for (var key in qs) {categories.push(key);}

		displayBoard(6, categories.length, categories);	
		displayNames(board.p1, board.p2, board.p3);

		//when you click a box on the jeopardy board
		$("#board td").click(function(){
			var ID = $(this).attr("id");
			var category = ID.split("_")[0];
			var itemNr = ID.split("_")[1];
			var qa = qs[category][itemNr];
			$("#infobox").removeClass("hidden");
			$("#infobox #question").html(qa['q']);
			$(this).addClass("completed");
		});

		 $("#infobox").click(function(){
		 	//$("#close").click(function(){
			$("#overlay, #infobox").addClass("hidden");
            reset(); //resets times, blocks all buzzers, unreds all "incorrect" answers

		 });

		 //resets all player scores to 0
		 for (var i = 0; i < 3; i++) {
		 	var s = Scores.findOne({player: i});
		 	Scores.update(s._id, {$set: {score: 0}});
		 }
	}

	displayBoard = function(height, width, labels) { 
		var table = document.getElementById("board");
		table.innerHTML = '';

		for (var row=0; row<height; row=row+1) {
			var rowEl = $("<tr>");
			if (row === 0){
				for (var idx in labels){
					$("<th>").attr({class: 'header'})
							 .text(labels[idx])
							 .appendTo(rowEl); 
				}
			} else {
				for (var col=0; col<width; col=col+1) {
					$("<td>").attr({class: labels[col], 
									id: labels[col]+"_"+row})
							 .text("$"+row*100)
							 .appendTo(rowEl);          
				}
			}
			rowEl.appendTo("#board");    
		}   
	}
    
    displayNames = function(n1,n2,n3){
        $(".pl")[0].innerHTML=n1;
        $(".pl")[1].innerHTML=n2;
        $(".pl")[2].innerHTML=n3;
    }

	fastest = function(p) {
        var time = 10000000000000000000000000000000000;
        var player;
		for(var i in Times.find().fetch()){
			if (Times.find().fetch()[i].time<time){
				player=Times.find().fetch()[i].player;
				time=Times.find().fetch()[i].time;
			}
		} return (player == p);
	}

	Template.body.helpers({
        thankYou: function(){
            return Thank.findOne().ty;
        },
		prisOrElla: function() {
			if (Meteor.user()) {
				var pris = (Meteor.user().username == "plee3");
				var ella = (Meteor.user().username == "hchao");
				return ella || pris;
			}
		}
		
	})
	
	Template.board.helpers({
		score1: function() {		
			var score = Scores.findOne({player: 1}).score;
			if (score < 0) return "-$" + -score;
			else return "$" + score;
		},
		score2: function() {
			var score = Scores.findOne({player: 2}).score;
			if (score < 0) return "-$" + -score;
			else return "$" + score;
		},
		score3: function() {
			var score = Scores.findOne({player: 3}).score;
			if (score < 0) return "-$" + -score;
			else return "$" + score;
		},
		p1fastest: function() { return (fastest("player1"));}, 
		p2fastest: function() { return (fastest("player2"));}, 
		p3fastest: function() { return (fastest("player3"));},
        p1red: function() { return Red.findOne({player:1}).red;}, 
		p2red: function() { return Red.findOne({player:2}).red;}, 
		p3red: function() { return Red.findOne({player:3}).red;},
		neg1: function() {return (Scores.findOne({player: 1}).score < 0);},
		neg2: function() {return (Scores.findOne({player: 2}).score < 0);},
		neg3: function() {return (Scores.findOne({player: 3}).score < 0);},
	})

	Template.button.events({
		"click #button": function(){
			if (!Blocked.findOne().blocked) {
				if (Times.find().count()==0){
					Times.insert({
						player:Meteor.user().username,
						userId:Meteor.user()._id,
						time:new Date().getTime()
					})
				}
			}
		}
	})

	Template.button.helpers({
		compare:function(){
			for(var i in Times.find().fetch()){
				var player;
				var time = 10000000000000000000000000000000000;
				if (Times.find().fetch()[i].time<time){
					player=Times.find().fetch()[i].player;
					time=Times.find().fetch()[i].time;
				}
			} console.log(player);
		}
	})

	Accounts.ui.config({
	   passwordSignupFields: 'USERNAME_ONLY'
	});
}   
    
if (Meteor.isServer) {
	wQuestions = {
		"History":{
		    "1":{"q": "Wellesley College was officially founded in this year.",
		         "a": "What is 1870?"},
		    "2":{"q": "Wellesley’s Latin motto: Non _____ sed ______.",
		         "a": "What are ministrari and ministrare?"},
		    "3":{"q": "She was the first president of Wellesley.",
		         "a": "Who was Ada Howard?"},
		    "4":{"q": "This was the original name of Wellesley College.",
		         "a": "What is Wellesley Female Seminary?"},
		    "5":{"q": "This large building was destroyed by a fire in 1914.",
		         "a": "What is College Hall?"}
		},
		"Women’s Colleges":{
		    "1":{"q": "This is the only historical “7 sisters” college in Pennsylvania.",
		         "a": "What is Bryn Mawr?"},
		    "2":{"q": "This famous author and noted feminist graduated from Smith College in 1942.",
		         "a": "Who is Betty Friedan?"},
		    "3":{"q": "These are the 2 “7 Sisters” colleges that are no longer women’s colleges.",
		         "a": "What are Radcliffe and Vassar?"},
		    "4":{"q": "30% of women in this U.S. branch of government attended a women’s college.",
		         "a": "What is Congress?"},
		    "5":{"q": "In 1990, trustees of this women’s college decided to allow men, until strikes, boycotts, and protesting reversed their decision.",
		         "a": "What is Mills College?"}
		},
		"Campus":{
		    "1":{"q": "This specialty residence hall has the smallest square footage.",
		         "a": "What is Simpson (West)?"},
		    "2":{"q": "The guild of carillonneurs play music in this campus structure.",
		         "a": "What is Galen Stone tower?"},
		    "3":{"q": "This group of buildings stands where College Hall used to be.",
		         "a": "What is Tower Court (Complex)?"},
		    "4":{"q": "The Davis Museum and Cultural Center opened in this year.",
		         "a": "What is 1993?"},
		    "5":{"q": "This residence hall honors the composer of &quot;America the Beautiful.&quot;",
		         "a": "What is Bates?"}
		},
		"Alumnae":{
		    "1":{"q": "This ‘62 alum was a screenwriter, known for &quotWhen Harry met Sally&quot; and &quot;Sleepless in Seattle.&quot;",
		         "a": "Who is Nora Ephron?"},
		    "2":{"q": "This 1914 graduate is known under the pen name Carolyn Keene.",
		         "a": "Who is Harriet Stratemeyer Adams?"},
		    "3":{"q": "This ‘83 alum is a former astronaut and NASA Space Shuttle pilot and commander, and currently serves on the " +
						"Wellesley College Board of Trustees.",
		         "a": "Who is Pamela Melroy?"},
		    "4":{"q": "This CNBC host and anchor was named one of the &quot;100 Most Influential Hispanic Women in America,&quot; and " +
						"graduated from Wellesley in 1991.",
		         "a": "Who is Michelle Caruso-Cabrera?"},
		    "5":{"q": "This alum is a Jeopardy! champion and has the show's second-longest winning streak and the longest female winning streak.",
		         "a": "Who is Julia Collins?"}
		},
		"Faculty":{
		    "1":{"q": "This Poli-Sci professor was a chairman of the Fulbright and a mentor to Hillary Clinton during her Wellesley years.",
		         "a": "Who is Alan Schechter?"},
		    "2":{"q": "The associate director of Wellesley’s Center for Women and a women’s studies scholar, her works sparked the &quot;check " +
						"your privilege&quot; movement.",
		         "a": "Who is Peggy McIntosh?"},
		    "3":{"q": "This prize is awarded to 3 professors at commencement every year.",
		         "a": "What is the Pinanski (Teaching) Prize?"},
		    "4":{"q": "This Wellesley English professor and poet was nominated for a Pulitzer Prize.",
		         "a": "Who is Frank Bidart?"},
		    "5":{"q": "This Professor of Economics Emeritus has done ground-breaking research in real estate, housing, and public finance.",
		         "a": "Who is Chip Case?"}
		},
		"Student Life":{
		    "1":{"q": "One of the “things to do before you graduate” prompts students to run naked across this outdoor location.",
		         "a": "What is Severance Green?"},
		    "2":{"q": "Wellesley students hold signs prompting athletes to kiss them during this annual event.",
		         "a": "What is the Boston Marathon?"},
		    "3":{"q": "This society was founded by Henry Durant and remains the oldest society still active on campus.",
		         "a": "What is the Shakespeare society?"},
		    "4":{"q": "This loud tradition takes place the night before final exams.",
		         "a": "What is the primal scream?"},
		    "5":{"q": "This is the name of the Wellesley College yearbook.",
		         "a": "What is the Legenda?"}
		}
	};

	gQuestions = {
		'Science': {
			'1': {	'q': "In the not fully understood Mpemba Effect, hot water sometimes does this faster than cold.",
					'a': "What is freeze?" },
			'2': {	'q': "Cover your ears! A jet taking off has a sound level of about 140 of these units.",
					'a': "What are decibels?" },
			'3': {	'q': "Debate continues as to why cats do this, which has a pattern & frequency between 25 & 150 hertz.",
					'a': "What is purr?" },
			'4': {	'q': "It's the invisible part of the spectrum from about 800 nanometers to 1 millimeter in wavelength",
					'a': "What is infrared?" },
			'5': {	'q': "An abnormal fear of water, it’s also another name for rabies.",
					'a': "What is hydrophobia?" }
		},
		'Vocabulary': {
			'1': {	'q': "This 8-letter word means the right to vote, not to endure pain; the 19th Amendment gave it to American women",
					'a': "What is suffrage?" },
			'2': {	'q': "Italian for &quot;unknown&quot;, it's how a person in disguise might &quot;travel&quot;",
					'a': "What is incognito?" },
			'3': {	'q': "This 6-letter test checks the acidity or alkalinity of a solution",
					'a': "What is litmus?" },
			'4': {	'q': "Call it a tadpole or call it this 8-letter word, it's still a newly hatched frog",
					'a': "What is pollywog?" },
			'5': {	'q': "This adjective means both &quot;bloody&quot; & &quot;cheerfully optimistic&quot;",
					'a': "What is sanguine?	" }
		},
		'Animals': {
			'1': {	'q': "That umpire was &quot;as blind as&quot; this mammal (not the equipment used in the game)",
					'a': "What is the bat?" },
			'2': {	'q': "According to mythology, about once every 500 years, it builds a funeral pyre & allows itself to be consumed by the flames",
					'a': "What is the phoenix?" },
			'3': {	'q': "The &quot;colossal&quot; type of this creature is the largest invertebrate & has the largest eyes of any animal",
					'a': "What is the squid?" },
			'4': {	'q': "This fastest land mammal can reach 45 mph in 2 seconds flat; go cat, go!",
					'a': "What is the cheetah?" },
			'5': {	'q': "Woolly but not so mammoth, I'm a cria, the young of this South American animal, Lama pacos",
					'a': "What is an alpaca?" }
		},
		'Psychology': {
			'1': {	'q': "Long-term types of this include episodic, semantic & procedural.",
					'a': "What is memory?" },
			'2': {	'q': "Whoopi Goldberg & Tom Cruise are among sufferers from this learning disability that causes trouble reading.",
					'a': "What is dyslexia?" },
			'3': {	'q': "This musical vehicle &quot;effect&quot; is where people feel pressured to conform; hop on it!",
					'a': "What is (the) bandwagon?" },
			'4': {	'q': "This adjective refers to the rear lobe of the brain.",
					'a': "What is occipital?" },
			'5': {	'q': "This Latin word for &quot;mask&quot; refers to one's public image as distinguished from the inner self.",
					'a': "What is persona?	" }
		},
		'Get a Job': {
			'1': {	'q': "Joseph Wright painted this kind of bygone sort of chemist who tried to turn other metals into gold.",
					'a': "What is an alchemist?" },
			'2': {	'q': "A fletcher aims to live up to his name origin by making these pointy objects",
					'a': "What are arrows?" },
			'3': {	'q': "A hospital volunteer job, with accompanying uniform, for teenagers.",
					'a': "What is a candy striper?" },
			'4': {	'q': "Often low on India's caste system, a chai wallah is one who makes this.",
					'a': "What is tea?" },
			'5': {	'q': "Inspectors of these make sure they're the correct size & that all 21 pips are in the right place on the faces",
					'a': "What are dice?" }
		},
		'Colors': {
			'1': {	'q': "1904: Picasso's &quot;Woman Ironing&quot; exemplifies this colorful &quot;period&quot; of his career",
					'a': "What is (his/the) blue period?" },
			'2': {	'q': "Beyoncé's daughter sounds like a colorful plant with this first & middle name",
					'a': "What/who is Blue Ivy?" },
			'3': {	'q': "What is the color of the incoming class of 2019?",
					'a': "What is yellow?" },
			'4': {	'q': "Since Georgetown had students who served on both sides in the Civil War, these became the school's colors in 1876",
					'a': "What are  blue and grey?" },
			'5': {	'q': "Myrtle or absinthe.",
					'a': "What is green?" }
	    }
	};

	cQuestions = {
		'Wellesley Acronyms': {
			'1': {	'q': "ARB.",
					'a': "What is Academic Review Board?" },
			'2': {	'q': "CRW.",
					'a': "What is the Center for Research on Women?" },
			'3': {	'q': "DS.",
					'a': "What is Davis Scholar?" },
			'4': {	'q': "SBOG.",
					'a': "What is the Schneider Board of Governors?" },
			'5': {	'q': "WCC.",
					'a': "What is the Wellesley College Club?" }
		},
		'Rhyme Time': {
			'1': {	'q': "Rose-colored substance used to write a letter",
					'a': "What is pink ink?" },
			'2': {	'q': "A magazine story about a neutron or proton",
					'a': "What is a particle article?" },
			'3': {	'q': "Precipitation falling on a New Orleans college",
					'a': "What is Tulane rain?" },
			'4': {	'q': "A small parcel containing a stringed tennis tool",
					'a': "What is a racket packet?" },
			'5': {	'q': "Fine powdery remains from a piece of oxidized metal",
					'a': "What is rust dust?" }
		},
		'Wellesley Courses': {
			'1': {	'q': "This grading system was introduced for the first semester first years of 2018.",
					'a': "What is shadow grading?" },
			'2': {	'q': "Wellesley Students must complete ___ semesters of P.E. to graduate.",
					'a': "What is 2?" },
			'3': {	'q': "This type of course is required for all first years at Wellesley.",
					'a': "What is writing?" },
			'4': {	'q': "Due to Wellesley’s grading policy, most courses are not permitted to have a mean GPA above this number.",
					'a': "What is 3.33?" },
			'5': {	'q': "In December 2012, Wellesley College became the first liberal arts college to join the this learning " + 
							"collaborative, and also the first women’s college to offer massive open online courses (MOOCs).",
					'a': "What is edX?" }
		},
		'Animals': {
			'1': {	'q': "That umpire was &quot;as blind as&quot; this mammal (not the equipment used in the game)",
					'a': "What is the bat?" },
			'2': {	'q': "According to mythology, about once every 500 years, it builds a funeral pyre & allows itself to be consumed by the flames",
					'a': "What is the phoenix?" },
			'3': {	'q': "The &quot;colossal&quot; type of this creature is the largest invertebrate & has the largest eyes of any animal",
					'a': "What is the squid?" },
			'4': {	'q': "This fastest land mammal can reach 45 mph in 2 seconds flat; go cat, go!",
					'a': "What is the cheetah?" },
			'5': {	'q': "Woolly but not so mammoth, I'm a cria, the young of this South American animal, Lama pacos",
					'a': "What is an alpaca?" }
		},
		'Town of Wellesley': {
			'1': {	'q': "This citrus-named restaurant (thankfully) delivers to Wellesley college.",
					'a': "What is Lemon Thai?" },
			'2': {	'q': "This ice-cream place is a Wellesley favorite.",
					'a': "What is J.P Licks?" },
			'3': {	'q': "In addition to Wellesley, Babson, and Olin, this college campus is also in the city of Wellesley.",
					'a': "What is Massachusetts Bay Community College? (Mass Bay)" },
			'4': {	'q': "The town of Wellesley was once a part of this nearby city.",
					'a': "What is Needham?" },
			'5': {	'q': "This author and poet resided in Wellesley as a child, but later attended Smith College.",
					'a': "Who is Sylvia Plath?" }
		},
		'Languages': {
			'1': {	'q': "Ethiopia's official language, Amharic, is the world's second most-widely spoken Semitic language; this is first",
					'a': "What is Arabic?" },
			'2': {	'q': "Latvian, one of the oldest European languages, is related to this, the classical language of Hinduism",
					'a': "What is Sanscrit?" },
			'3': {	'q': "With about 9 million speakers, it's the most widely spoken Scandinavian language.",
					'a': "What is Swedish?" },
			'4': {	'q': "In New Zealand, the official language are English, New Zealand Sign Language & this native tongue",
					'a': "What is Maori?" },
			'5': {	'q': "The founder of a school for the deaf, he developed American sign language from a French version",
					'a': "Who is (Thomas) Gallaudet?" }
		}
	};

    if (Red.find().count()==0) {
        Red.insert({player:1,red:false});
        Red.insert({player:2,red:false});
        Red.insert({player:3,red:false});
    }

    if (Blocked.find().count()==0) {
		Blocked.insert({blocked: true});
	}

	if (Scores.find().count() == 0) {
		Scores.insert({player: 1, score: 0});
		Scores.insert({player: 2, score: 0});
		Scores.insert({player: 3, score: 0});
	}

	if (Rounds.find().count() == 0) {
		Rounds.insert({name:"w", p1: "Gwen", p2: "Kelsey", p3: "Sally", questions: wQuestions});
		Rounds.insert({name:"g", p1: "Melissa", p2: "Ann", p3: "Kelly", questions: gQuestions});
		Rounds.insert({name:"c", p1: "Julia", p2: "---", p3: "---", questions: cQuestions});
	}
    
    if (Thank.find().count() == 0) {
        Thank.insert({ty: false});
    }
}
