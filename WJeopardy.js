Questions = new Mongo.Collection("questions");
Scores = new Mongo.Collection("scores");
Times=new Mongo.Collection("times");

if (Meteor.isClient) {
	
	if (Scores.find().count() == 0) {
		Scores.insert({player: "p1", score: 0});
		Scores.insert({player: "p2", score: 0});
		Scores.insert({player: "p3", score: 0});
	}

	displayBoard=function(height, width, labels) {  
        console.log('hi');
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

	Template.body.helpers({
		prisOrElla: function() {
			if (Meteor.user()) {
				var pris = (Meteor.user().emails[0].address == "plee3@wellesley.edu");
				var ella = (Meteor.user().emails[0].address == "hchao@wellesley.edu");
				return ella || pris;
			}
		}
		
	})
	
	Template.board.helpers({
		score1: function() {return Scores.findOne({player: "p1"}).score;},
		score2: function() {return Scores.findOne({player: "p2"}).score;},
		score3: function() {return Scores.findOne({player: "p3"}).score;},
	})
		
		
	Template.board.rendered=function(){
			var categories = ["History", "Women’s Colleges", "Campus", "Alumnae", "Faculty",  "Student Life"];
			displayBoard(6, categories.length, categories);	

		$("#board td").click(function(){
			var ID = $(this).attr("id");
			var category = ID.split("_")[0];
			var itemNr = ID.split("_")[1];
			var qa = wellesley_round1[category][itemNr];
			//$("#overlay, #infobox").removeClass("hidden");
			$("#infobox").removeClass("hidden");
			$("#infobox #question").html(qa['q']);
			$(this).addClass("completed");
		});

		  $("#close").click(function(){
			$("#overlay, #infobox").addClass("hidden");
		  });

	}

	Template.button.events({
		"click #button": function(){
			if (Times.find({id: Meteor.user()._id}).count()==0){
				Times.insert({
					player:Meteor.user().emails[0].address,
					userId:Meteor.user()._id,
					time:new Date().getTime()
			})
			}
		}
	})

	Template.button.helpers({
		compare:function(){
			for(var i in Times.find().fetch()){
				var player;
				var time=0;
				if (Times.find().fetch()[i].time>time){
					player=Times.find().fetch()[i].player;
					time=Times.find().fetch()[i].time
				}
			}
			console.log(player);
		}
	})
}   
    
    
if (Meteor.isServer) {
	Meteor.methods({
		updateScore: function(plyr, pts) {
			var player = Scores.findOne({player: plyr});
			Scores.update(player._id, {$inc: {score: pts}});
		},
		resetTime: function() {
			Times.remove({"_id": Times.findOne()._id});
		}
	});
	
	
}

/**QUESTIONS**/

var wellesley_round1 = {
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
             "a": "What is Bates?"},
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
             "a": "What is the Legenda?"
            }
    }
};

var wellesley_round2 = { 
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
	'Acronyms': {
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
	'Courses and Classes': {
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
	'Admissions and Financial Aid': {
		'1': {	'q': "Wellesley has eliminated loans for families making under this dollar amount",
				'a': "What is $60,000?" },
		'2': {	'q': "As of 2013, this is Wellesley’s acceptance rate.",
				'a': "What is 29%? (also accept 28% due to rounding)." },
		'3': {	'q': "This tuition estimator was recently praised in the NYT for its simplicity and accuracy.",
				'a': "What is my inTuition?" },
		'4': {	'q': "Wellesley meets this percentage of demonstrated financial need.",
				'a': "What is 100%?" },
		'5': {	'q': "This is the name of Wellesley’s admissions policy with regards to financial aid.",
				'a': "What is need-blind?" }
	},
	'MIT and Wellesley': {
		'1': {	'q': "This a capella group has students from both Wellesley and MIT",
				'a': "What are the Toons?" },
		'2': {	'q': "This MIT-Wellesley dance team competes year-round throughout the northeast.",
				'a': "What is the ballroom dance team?" },
		'3': {	'q': "The dual degree program with MIT gives Wellesley students an opportunity to earn a degree in this area of study.",
				'a': "What is engineering?" },
		'4': {	'q': "Wellesley students conducting summer research at MIT often stay in these MIT abodes.",
				'a': "What are fraternity houses?" },
		'5': {	'q': "In 2013, Wellesley received a grant from the Mellon Foundation, which enabled Wellesley to begin " +
						"offering this language in collaboration with MIT.",
				'a': "What is Portuguese?" }
	},
	'Things you should have learned': {
		'1': {	'q': "In math, this is the name of the rate of change, or the slope of the tangent line of a graph.",
				'a': "What is the derivative?" },
		'2': {	'q': "Affect and effect: The one starting with this letter is the noun.",
				'a': "What is “e”?" },
		'3': {	'q': "The 1914 assassination of this Austrian archduke is considered by many to be a step towards the first world war.",
				'a': "Who was Franz Ferdinand?" },
		'4': {	'q': "This is the name of the second group (or column) of elements on the periodic table.",
				'a': "What are the alkaline earth metals?" },
		'5': {	'q': "This pop artist created this patriotic work, Three Flags:",
				'a': "Who is Jasper Johns?" }	
	}
};

var general_round1 = { 
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
	'Good Morning around the World': {
		'1': {	'q': "God morgen.",
				'a': "What is Danish? (alt: Norwegian)" },
		'2': {	'q': "Bom dia.",
				'a': "What is Portuguese? " },
		'3': {	'q': "Bore da.",
				'a': "What is Welsh?" },
		'4': {	'q': "Labas rytas.",
				'a': "What is Lithuanian?" },
		'5': {	'q': "Sawubona.",
				'a': "What is Zulu?	" }
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

var general_round2 = { 
	'Anatomy': {
		'1': {	'q': "The roof of the mouth is made up of hard & soft ones that are covered by mucous membranes.",
				'a': "What are palates?" },
		'2': {	'q': "These smallest blood vessels are about one-eighth the thickness of a strand of hair.",
				'a': "What are capillaries?" },
		'3': {	'q': "A microliter of blood contains from 150,000 to 400,000 of these blood-clotting bodies.",
				'a': "What are platelets?" },
		'4': {	'q': "Like the one in the nose, this wall that divides the heart lengthwise can deviate.",
				'a': "What is the septum?" },
		'5': {	'q': "It comprises about 62% of the weight of an average man; about 6% less in women.",
				'a': "What is water?" }
	},
	'Book Titles': {
		'1': {	'q': "Dan Chiasson’s latest collection of poems.",
				'a': "What is Bicentennial? " },
		'2': {	'q': "Which faculty member published: American Passage: The Communications Frontier in Early New England?",
				'a': "Who is Katherine Grandjean?" },
		'3': {	'q': "Who published: Converting Pirates Without Cannibalizing Purchasers: The Impact of Digital Distribution " +
						"on Physical Sales and Internet Piracy?",
				'a': "Who is Brett Denaher?" },
		'4': {	'q': "Who published the groundbreaking report on the Tuskegee Syphilis Study?",
				'a': "Who is Susan Reverby?" },
		'5': {	'q': "Louisa May Alcott: &quot;Life at Plumfield with Jo's Boys&quot;.",
				'a': "What is Little Men?" },
		'6': {	'q': "Barack Obama: &quot;A Story of Race and Inheritance&quot;.",
				'a': "What is Dreams from my Father?" },
		'7': {	'q': "&quot;Twilight&quot; was the original title of his &quot;The Sound and the Fury&quot;.",
				'a': "Who is Faulkner?" },
		'8': {	'q': "A tale by Madeleine L'Engle about a marine biology student: &quot;The Arm of&quot; this sea creature.",
				'a': "What is the Starfish?	" }
	},
	'Food Around the World': {
		'1': {	'q': "Scots love these &quot;planetary&quot; chocolate bars--deep fried",
				'a': "What are Mars Bars?" },
		'2': {	'q': "This dumpling with a rhyming name might be steamed & served with duck sauce",
				'a': "What is a wonton?" },
		'3': {	'q': "An Indian ingredient, Ghee is a form of clarified this that's been slowly melted, separating the milk solids.",
				'a': "What is butter?" },
		'4': {	'q': "Blumenkohl is German for this cabbage family member",
				'a': "What is cauliflower?" },
		'5': {	'q': "Feijoada, a hearty stew of smoked meats & beans, is a national dish of this South American country",
				'a': "What is Brazil?" }
	},
	'Philosophy': {
		'1': {	'q': "Heidegger said the most basic question in philosophy is &quot;why is there something rather than&quot; this.",
				'a': "What is nothing?" },
		'2': {	'q': "The moral type of this &quot;ism&quot; insists that each society be judged by its own standards.",
				'a': "What is relativism?" },
		'3': {	'q': "The name of this study of moral principles is derived from a Greek word meaning &quot;habit&quot;.",
				'a': "What is ethics?" },
		'4': {	'q': "From the Greek for &quot;pleasure&quot;, it's the doctrine that pleasure is the highest good.",
				'a': "What is hedonism?" },
		'5': {	'q': "If you want to know what it is to know & how what we know is known, we know you'll like this branch of philosophy.",
				'a': "What is epistemology?	" }
	},
	'Crossword clues "L"': {
		'1': {	'q': "Any new car that breaks down 60 times a day (5)",
				'a': "What is a lemon?" },
		'2': {	'q': "Female rent collector (8)",
				'a': "What is a landlady?" },
		'3': {	'q': "Feminine digit cakes (11)",
				'a': "What are lady’s fingers?" },
		'4': {	'q': "A cradle song (7)",
				'a': "What is a lullaby?" },
		'5': {	'q': "Camel back-breaker (4,5)",
				'a': "What is (the) last straw?" }
	},
	'Sports': {
		'1': {	'q': "In 1896, for the longest Olympic event in this sport the athletes were taken 1,200 meters out to sea by boat & left there",
				'a': "What is swimming?" },
		'2': {	'q': "In 1998 she became the first U.S. soccer player to score 100 international goals",
				'a': "Who is Mia Hamm?" },
		'3': {	'q': "The Encyclopedia Britannica calls it &quot;the oldest of equestrian sports&quot;, dating to ancient Persia",
				'a': "What is polo?" },
		'4': {	'q': "In baseball, it measures 18 feet in diameter & reaches a height of 10 inches at its center",
				'a': "What is the pitching mound?" },
		'5': {	'q': "42-pound polished stones with a handle on top are slid on ice in this sport",
				'a': "What is curling?	" }
	}
};

var general_round3 = { 
	'Pronoun': {
		'1': {	'q': "4-letter word following &quot;watch&quot; or &quot;now hear&quot;; it's just about the most important word " +
						"we use in &quot;Jeopardy!&quot; clues",
				'a': "What is this?" },
		'2': {	'q': "As a pronoun, it's a form of the possessive case of &quot;I&quot;; as a noun, it's where you extract ore",
				'a': "What is mine?" },
		'3': {	'q': "The only thing you have to fear is fear of not knowing this 6-letter word is an emphatic appositive of &quot;which&quot;",
				'a': "What is itself?" },
		'4': {	'q': "It's the objective case of they, used as a direct or indirect object",
				'a': "What is them?" },
		'5': {	'q': "This archaic pronoun can be used as a plural of &quot;thou&quot;, especially preceding &quot;of little faith&quot;",
				'a': "What is ye?" }
	},
	'Average': {
		'1': {	'q': "The average is also called the arithmetic this",
				'a': "What is mean?" },
		'2': {	'q': "World Book says the average number of these creatures in one sq. mile equals the number of people on Earth",
				'a': "What are insects?" },
		'3': {	'q': "With 32, workers in Sweden take more of these per year than workers in any other country",
				'a': "What are vacation days?" },
		'4': {	'q': "The average surface temperature on this planet is more than 860 degrees F.",
				'a': "What is venus?" },
		'5': {	'q': "According to the MPAA, Americans attend an average of 7.6 of these a year",
				'a': "What  are movies?	" }
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
	'Languages': {
		'1': {	'q': "Ethiopia's official language, Amharic, is the world's second most-widely spoken Semitic language; this is first",
				'a': "What is Arabic?" },
		'2': {	'q': "Latvian, one of the oldest European languages, is related to this, the classical language of Hinduism",
				'a': "What is Sanscrit?" },
		'3': {	'q': "With about 9 million speakers, it's the most widely spoken Scandinavian language	",
				'a': "What is Swedish?" },
		'4': {	'q': "In New Zealand, the official language are English, New Zealand Sign Language & this native tongue",
				'a': "What is Maori?" },
		'5': {	'q': "The founder of a school for the deaf, he developed American sign language from a French version",
				'a': "Who is (Thomas) Gallaudet?" }
	},
	'Geology': {
		'1': {	'q': "The largest type of rock fragment, it's defined as more than 10&quot; across, though we think of it as huge",
				'a': "What is a boulder?" },
		'2': {	'q': "This layer of rock between the Earth's core & crust makes up about 85 percent of the planet's mass",
				'a': "What is the mantle?" },
		'3': {	'q': "This radioactive isotope is used to date rocks from 100 to 50,000 years old",
				'a': "What is carbon-14?" },
		'4': {	'q': "This &quot;table&quot; is the saturated area of bedrock; it tends to follow the contours of the land",
				'a': "What is the water table?" }
	},
	'World Heritage Sites': {
        '1': {'q': "Famous for its half dome & waterfalls, this California national park is a World Heritage Site.",
              'a': "What is Yosemite?" },
        '2': {'q': "These islands, made a national park by Ecuador in 1959, were made a World Heritage Site in 1978.",
              'a': "What are the galapagos?" },
        '3': {'q': "This South American capital didn't exist 60 years ago.",
              'a': "What is Brazilia?" },
        '4': {'q': "Keep it under your hat, the Medina section of this Moroccan city is protected by UNESCO's World Heritage Committee.",
              'a': "What is Fez?" },
        '5': {'q': "A major maritime power from the 10th century, this Italian city is &quot;an extraordinary architectural masterpiece&quot;",
              'a': "What is Venice?" }
	}
};
