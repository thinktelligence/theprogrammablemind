export NODE=node
if [[ ${1} == "i" ]]; then
  export NODE='node inspect'
fi
#node properties -q "greg doesnt have wings does greg have wings" -d -g
# $NODE properties -q "greg doesnt have wings" -d -g
# $NODE properties -q -d -g 'the name of greg is greg greg is readonly the name of greg is fred'
# $NODE ordering -q 'greg likes bananas and apples what does greg like' -d

# apply like/0 counter == 6
# $NODE ordering -q 'greg likes bananas and grapes what does greg like' -d -g
# $NODE ordering -q 'the name of greg is greg greg is readonly the name of greg is fred' -d -g
# $NODE inspect wendy -q "what is your name"
# $NODE inspect hierarchy -q 'cats are mammels what are the types of mammels'
# $NODE foods -q 'strips are food' -d
# $NODE foods -q 's2trips are food' -d
# $NODE inspect kid -q 'what does wendy like'
# $NODE inspect emotions -q 'greg feels angry what does greg feel' -d
# $NODE emotions -q 'what is the emotion of greg' -d
# $NODE inspect emotions -q 'what does greg feel' -d
# $NODE inspect emotions -q 'what does greg feel' -d
# $NODE inspect foods -q 'what are the type of food' -d
# $NODE inspect kid -q 'what does wendy like' -d
# $NODE inspect kid -q 'does wendy like bananas' -d
# $NODE kid  -q "alice likes grapes\nhanna means alice\nwhat is hanna's name" -d
# $NODE inspect kid -q "what is hanna's name" -d -g
# $NODE inspect ordering -q "x like y x want y?" -d
# $NODE inspect ordering -q "x like y x want y?" -d
# $NODE ordering -q "if x likes y then x wants y" -d
# $NODE inspect ordering -q "does x want y" -d
# $NODE ordering -q "if x likes y then x wants y x likes y does x want y"
# $NODE ordering -q "if x likes y then x wants y x likes y what does x want"
# $NODE ordering -q "if x likes y then x wants y x likes y\nwhat does x want"
# $NODE meta -q "if e or f then g" -d -g
# $NODE inspect meta -q "if e or f then g gq" -d -g
# $NODE inspect meta -q "if f then g gq" -d -g

# $NODE ordering -q "if x likes y or x loves y then x wants y x likes y\ndoes x want y" -g
# $NODE ordering -q "if x likes y or x loves y then x wants y" -g -d

# $NODE meta -q "if e or f then g" -d -g
# $NODE ordering -q "if x likes y or x loves y then x wants y x loves y\ndoes x want y" -g

# $NODE ordering -q "if x likes y or x loves y then x wants y x loves y\nwhat does x want" -g
# $NODE ordering -q "if x likes y or x loves y then x wants y x likes z x loves y\nwhat does x want" -g -d
# $NODE ordering -q "if x likes y or x loves y then x wants y x likes z x loves y\ndoes x want z" -g -d
# $NODE ordering -q "if x likes y or x loves y then x wants y x likes z\ndoes x want z" -g -d

# $NODE ordering -q "if x likes y or x loves y then x wants y x loves y\nwhat does x want" -g

# $NODE ordering -q "if x likes y or x loves y then x wants y x loves y x likes z\nwhat does x want" -g
# $NODE ordering -q "if x likes y or x loves y then x wants y x loves y x likes y\nwhat does x want" -g

# add text proerty to context 
# find out why cat is unknown
# $NODE properties -q "sentientBeing1 feels emotion1 means the emotion of sentientBeing1 is emotion1" -g -d
# $NODE inspect stgame -q 'kirk what is your name' -d -g
# stacked $NODE properties -q "alice's sister is wendy wendy's cat is cleo\nwho is the cat of the sister of alice" -g -d
# stacked $NODE properties -q "the age of greg is 23 what is greg's age" -g -d
# $NODE inspect properties -q "alice's sister is wendy wendy's cat is cleo\nwho is alice's sister's cat" -g -d
# $NODE properties -q "alice's sister is wendy" -g -d
# $NODE inspect avatar -q "your name is greg what is your name" -d -g
# $NODE avatar -tva -g
# $NODE emotions -q 'greg feels angry what is the emotion of greg' -d -g
# $NODE avatar -q 'your name is greg what is your name' -d -g
# $NODE properties -q 'greg has eyes greg has eyes?' -g -d
# $NODE properties -q 'the age of greg is 23 what is the age of greg' -g -d
# $NODE inspect avatar -q 'your name is greg what is your name' -d -g
# $NODE inspect properties -q 'what is the property of object' -d -g
# $NODE properties -q 'greg has eyes?' -g -d
# $NODE hierarchy -q 'cats and dogs are animals' -g -d
# $NODE inspect ordering -q "if x likes y or x loves y then x wants y x loves y x likes y\nwhat does x want" -g -d
# $NODE ordering -q "greg likes bananas does greg like bananas" -g -d
# $NODE ordering -tva -g
# $NODE ordering -q "if x likes y or x loves y then x wants y x loves y x likes y\nwhat does x want" -g -d
# $NODE kirk -q 'what is your name' -d -g
# $NODE crew -q 'you are kirk what is your name' -d -g
# $NODE crew -q 'you are kirk what is your name' -d -g
# $NODE inspect kid -q "what is hanna's name" -d -g
# $NODE kid -q "greg23 means alice\nwhat is greg23's name" -d -g
# $NODE kid -q "greg23 means alice" -d -g
# $NODE inspect properties -q "the age of greg is 23 what are the properties of greg" -d -g
# $NODE meta -q 'if f then g gq' -d -g
# $NODE ordering -q "wendy loves bananas what does wendy like" -d -g
# $NODE ordering -tva -g
# $NODE inspect wendy -q 'what is your name' -d -g
# $NODE kid -q "be brief what is wendy's name" -g -d
# $NODE ordering -q 'be brief x1 likes x2 does x1 like x2' -g -d
# $NODE inspect ordering -q 'be brief x1 likes x2 and x3 what does x1 like' -g -d
# $NODE ordering -q 'if x likes y then x wants y x likes y\nwhat does x want' -g -d
# $NODE ordering -q 'if x likes y or x loves y then x wants y x loves y\nwhat does x want' -g -d
# $NODE ordering -q 'wendy loves bananas what does wendy like' -g -d
# $NODE inspect ordering -q 'if x likes y then x wants y x likes y\nwhat does x want' -g -d
# $NODE meta -tva -g
# $NODE inspect meta -q 'if f then g gq' -d -g
# move the yesno in ordering 
# $NODE inspect ordering -q "wendy loves bananas what does wendy like" -d -g -r
# $NODE ordering -q "be brief x1 likes x2 what does x1 like" -d -g
# $NODE properties -q 'what is the property of object' -d -g
# $NODE properties -q 'the age of greg is 23\nwhat is the age of greg' -d -g
# $NODE ordering -q "be brief x1 likes x2 does x1 like x2" -d -g
# PARK $NODE ordering -q "if x likes y then x wants y x likes y\nwhat does x want" -d -g
# PARK $NODE ordering -q "if x likes y then x wants y x likes y\ndoes x want y" -d -g
# $NODE dialogues -q 'x is y?' -d -g
# $NODE scorekeeper -tva -g
# $NODE avatar -q 'greg has eyes greg has eyes?' -g -d
# $NODE avatar -q 'greg has eyes?' -g -d -r
# $NODE ordering -q 'wendy loves bananas what does wendy like' -g -d
# $NODE ordering -q "be brief x1 likes x2 does x1 like x2" -d -g
# $NODE people -g -q 'given name means first name' -d
#node inspect people -g -q 'the name of greg is 23' -d
# $NODE people -g -q 'given name means first name the given name of greg is greg what is the given name of greg' -d
# $NODE people -g -q 'the given name of greg is greg what is the given name of greg' -d
# $NODE people -g -q 'the name of greg is greg23 what is the name of greg' -d
# $NODE inspect people -g -q 'given name means first name the given name of greg is greg23 what is the given name of greg' -d
# TODO $NODE people -g -q 'given name means first name the first name of greg is greg23 what is the given name of greg' -d
# STACK $NODE inspect hierarchy -q 'a human is a mammel greg is a human is greg a mammel' -g -d
# $NODE inspect hierarchy -q 'a human is a mammel debug23' -g -d
# $NODE inspect hierarchy -q 'a human is a mammel greg is a human is greg a mammel' -d -g
# $NODE inspect foods -q 'what are the types of food' -d -g
# $NODE currency -q '20 dollars in euros' -g
# $NODE people -q 'given name means first name the first name of greg is greg23 what is the given name of greg' -d -g
# $NODE inspect avatar -q 'my name is greg what is my name' -d -g
# $NODE inspect foods -q "what are the types of food" -d -g
# $NODE ordering -q 'wendy loves bananas what does wendy like' -d -g
# PUSH $NODE people -q 'the given name of greg is greg23 what is the given name of greg' -d -g
# PUSH $NODE people -q 'the first name of greg is greg23 what is the given name of greg' -d -g
# $NODE inspect people -q 'the given name of greg is greg23' -d -g
# $NODE people -q 'the first name of greg is greg23' -d -g
# $NODE emotion -tva -g
# $NODE inspect people -q 'the first name of greg is greg23' -d -g
# $NODE people -q 'given name means first name the first name of greg is greg23 what is the given name of greg' -d -g
# $NODE inspect properties -q 'the name of greg is greg greg is readonly the name of greg is fred' -d -g
# $NODE inspect hierarchy -g -q 'greg is a human a human is a mammel\nis greg a human'  -d
# $NODE emotions -g -q 'sentientBeing1 feels emotion1 means the emotion of sentientBeing1 is emotion1' -d
# $NODE inspect pokemon -g -d -q 'what are the pokemon types'
# $NODE crew -rt -g
# $NODE pokemon -q 'who are the pokemen by type' -g
# $NODE pokemon -q 'what is pikachu' -g -d
# $NODE inspect hierarchy -q "mccoy's rank is doctor is mccoy a doctor" -g
# $NODE inspect hierarchy -q "mccoy is a man\nmccoy is a doctor\nis mccoy a man" -g -d
# $NODE pokemon -q 'what type is pikachu' -g -d
# $NODE pokemon -q 'who is electric type' -g -d
# $NODE inspect pokemon -q 'what is the type of pikachu' -g -d
# $NODE inspect foods -q 'what are the types of food' -g -d
# $NODE pokemon -q 'what type of pokemon is pikachu' -g
# $NODE ordering -q "if a likes or loves b then a wants b" -d -g
# $NODE ordering -q "if x likes y or x loves y then x wants y" -d -g
# $NODE inspect ordering -q 'wants is xfx between wanter and wantee' -d -g
# $NODE inspect people -q 'owns is xfx relation between owner and ownee' -g -d
# $NODE people -g -q 'who owns cleo' -d
# $NODE people -g -d -q 'wendy owns cleo what does wendy own'
# $NODE people -g -d -q 'wendy owns cleo wendy owns mary what does wendy own'
# $NODE people -g -d -q 'wendy owns cleo who is cleo owned by'
# cleo is owned by who
# [subject] owned [by] -> [owner]
# wendy owned cleo
# no arg 'by' converts to postfix -> arged by works like normal
# ((subject) (owned) [by]) -> owner
# cleo is owned by wendy means wendy owns cleo
# (cleo) [is] (owned by wendy) where (owned by wendy) == ownee
# version of is the unify cleo and ownee
# ([owned] ([by] ([wendy]))) -> [ownee] look at that
# $NODE people -g -d -q 'cleo is owned by wendy'
# $NODE people -g -d -q 'cleo is owned by who'
# $NODE people -g -d -q who is cleo owned by'
# $NODE people -g -d -q 'wendy owns cleo'
# $NODE inspect crew -q 'who are the crew members' -g -d
# $NODE dialogues -g -d -q 'what is it'
# $NODE people -g -d -q 'who is owned by wendy'
# $NODE people -g -d -q 'wendy owns cleo who is owned by wendy'
# $NODE animals -q 'cats are animals are cats animals?' -g -d
# DONE no associations with -rt
# incremenatl update of assocaition while generating
# using the test sentences to generate associations as well
# dont save the developement ones
# $NODE animals -rt -g
# $NODE inspect hierarchy -g
# $NODE inspect animals -rt -g
# $NODE hierarchy -q "a human is a mammel greg is a human is greg a mammel" -g -d
# greg is part of the tests associations and should not be there
# $NODE people -q "ownee is owned by owner means owner owns ownee" -g -d
# $NODE people -q "ownee is owned by owner means owner owns ownee" -g -d
# $NODE crew -tva -g -r 
# $NODE people -g -d -q 'wendy owns cleo'
# $NODE inspect people -q "ownee is owned by owner means owner owns ownee" -g -d
# $NODE meta -q "undefined means defined" -g -d
# sort association and hierarchy
# $NODE inspect people -q "ownee is owned by owner means owner owns ownee" -g -d
# $NODE people -q "cleo is owned by wendy who owns cleo" -g -d
# $NODE people -q "wendy owns cleo who owns cleo" -g -d
# $NODE people -q "wendy owns cleo what does wendy own" -g -d
# $NODE inspect people -q "cleo is owned by wendy who owns cleo" -g -d
# $NODE people -q "who owns cleo" -g -d
# $NODE properties -q 'greg has toes' -g -d
# $NODE animals -q "do mammals have wings" -g -d
# $NODE properties -q 'greg has toes greg has eyes?' -g -d
# $NODE animals -q 'do dogs have skin' -g -d
# $NODE properties -q 'greg doesnt have wings' -g -d
# $NODE properties -q 'greg doesnt have wings does greg have wings' -g -d
# $NODE people -tva -g 
# $NODE people -q 'the cat owned by wendy' -d
# $NODE people -q 'cleo is owned by wendy who owns cleo' -g -d
# TODO who is the person that owns cleo
# TODO setup focus for this one: $NODE people -q 'cleo is a cat wendy owns cleo who is the cat owned by wendy' -d
# $NODE people -q 'wendy owns cleo who is the cat owned by wendy' -d
# maybe cat is a class or type
#node people -q 'fred is a cat wendy owns cleo who is the cat owned by wendy' -d
# $NODE people -q 'ownee is owned by owner who is ownee owned by' -d

# two people named jeff talk about one have context resolve it
# $NODE people -q 'cleo is a cat wendy owns cleo who is the cat owned by wendy' -d
# $NODE people -q 'wendy owns cleo\nwho is cleo owned by' -d
# $NODE people -q 'cleo is owned by wendy who owns cleo' -d -g
# $NODE hierarchy -q 'a human is a mammel greg is a human is greg a mammel' -d -g
# CONFLICT
# $NODE people -q 'ownee23 is owned by owner23 who is ownee23 owned by' -d -g
# $NODE people -q 'fred is a cat wendy owns cleo who is the cat owned by wendy' -d -g
# TODO $NODE people -q 'ownee is owned by owner who is ownee owned by' -d -g -r
# TODO focusable -> make an evaluate for getting focus
# TODO fix words for disarm the phasers
# who is ownee owned by
# the owner that owns ownee
# owner owns ownee is owner
# TODO put ids in the sematnics and allow a partial odering def that one goes before another -> make the learnable
# PARAPHRASE WRONG
# $NODE people -q 'ownee23 is owned by owner23 who is ownee23 owned by' -d -g
# $NODE people -q 'who is ownee23 owned by' -d -g
# $NODE people -q 'fred is a cat wendy owns cleo who is the cat owned by wendy' -d -g
# $NODE people -q 'cleo is a cat wendy owns cleo who is the cat owned by wendy' -d -g
# "ownee23 is owned by owner23" instead of "ownee23 owned by ownee23 is owner23"
# $NODE people -q "cleo is a cat wendy owns cleo who is the cat owned by wendy" -d -g 
# $NODE people -q "cleo is owned by wendy who owns cleo" -d -g
# $NODE inspect people -q "cleo is owned by wendy" -d -g
# $NODE hierarchy -q 'a human is a mammel greg is a human is greg a mammel' -d 
# $NODE people -q 'cleo is a cat wendy owns cleo who is the cat owned by wendy' -d 
# $NODE people -q 'ownee23 is owned by owner23 who is ownee23 owned by' -d -g -r
# $NODE people -q 'ownee23 is owned by owner23 who is ownee23 owned by' -g
# $NODE properties -q 'greg has toes greg has eyes?' -g -d
# $NODE properties -q 'greg has toes' -g -d
# $NODE hierarchy -q 'cats and dogs are animals what are the types of animals' -g -d
# $NODE inspect hierarchy -q 'what are the types of animals' -g -d
# $NODE hierarchy -q 'cats and dogs are animals' -g -d
# $NODE properties -q 'xfx between a1 and a2' -g -d
# $NODE people -q 'ownee23 is owned by owner23 who is ownee23 owned by' -g -d
# $NODE people -q 'ownee23 is owned by owner23' -g -d
# $NODE people -q 'who is ownee23 owned by' -g -d
# $NODE crew -q 'disarm the phasers' -g
# $NODE inspect people -da '[["by",0],["is",0],["owned",0]]'
# $NODE people -q "ownee23 is owned by owner23 who is ownee23 owned by" -g -d
# $NODE people -q "owneevar is owned by ownervar" -g -d
# $NODE people -q 'who is ownee23 owned by' -g -d
# $NODE dialogues -q 'x is y?' -d -g
# $NODE pokemon -q 'pikachu squirtle weedle and pidgeot are pokemon' -d -g
# $NODE kid -q "wendy's cat is cleo" -d -g
# $NODE kid -q "who is wendy's cat" -g -d
# $NODE crew -q 'kirk is a crew member' -g -d -daa
# $NODE pokemon -q 'what type is pikachu' -d -g
# $NODE dialogues.js -q 'x is y?' -d -g
# $NODE people -q 'given name means first name the first name of greg is greg23 what is the given name of greg' -d -g 
# $NODE crew -q 'who are the crew members' -g -d
# $NODE crew -q 'the status of the photon torpedoes is armed\nwhat is the status of the photon torpedoes' -g -d
# $NODE reports -q 'show the quantity descending and the price ascending' -g -d
# $NODE reports -q 'call this report1\nshow report1' -g -d
# $NODE inspect reports -q 'call this report1' -g -d
# $NODE inspect reports -q 'call this report1\ndescribe report1' -g -d
# $NODE inspect reports -q 'call this report1\nlist the models\ncall this report2\ndescribe the reports' -g -d
# $NODE reports -g -q 'call this report1\nlist the models\ncall this report2\nshow report1 and report2'
# $NODE reports -q 'worth means price times quantity the price is 10 the quantity is 5 what is the worth' -g -d
# $NODE inspect dialogues -q 'x is 3 what is x' -d -g
# $NODE dialogues -q 'be brief x is 3 what is x what is it' -d -g
#  $NODE dialogues -q 'what is it' -d -g
# $NODE scorekeeper -q 'whose turn is it' -d -g
# $NODE scorekeeper -q 'greg got 10 points sara got 3 points greg got 2 points whose turn is it' -d -g
# $NODE reports -q 'call this report1\nlist the models\ncall this report2\nshow report1 and report2' -g -d
# $NODE reports -q 'call this report1\nlist the models\ncall this report2\nshow report2' -g -d
# $NODE inspect reports -q 'call this report1\ndescribe the reports' -g -d
# $NODE reports -q 'list the models\ncall this report1\nshow report1' -g -d
# $NODE inspect reports -q 'show price and supplier' -g -d
# $NODE emotions -q 'greg feels angry what is the emotion of greg' -g -d
# $NODE inspect properties -q 'the name of greg is greg greg is readonly the name of greg is fred' -g -d
# $NODE reports -q 'call this report1\ndescribe report1' -g -d
# $NODE reports -q 'list the models\ncall this report1\nshow report1' -g -d
# $NODE reports -q 'call this report1\ndescribe the reports' -g -d
# $NODE inspect reports -q 'show the quantity descending and the price ascending list the products' -g -d
# $NODE reports -q 'list the products' -g -d
# $NODE inspect reports -q 'call this report1 show report1' -g -d
# $NODE scorekeeper -q 'start a new game\ngreg and jah 20 points' -g -d
# $NODE reports -q 'call this report1\ndescribe report1' -g
# $NODE reports -q 'answer with sentences list the models' -g
# $NODE reports -q 'list the models\ncall this report1\nshow report1' -g
# $NODE inspect reports -q 'list the models' -g
# $NODE inspect reports -q 'show the quantity descending and the price ascending list the products' -g
# $NODE inspect reports -q 'answer with sentences list the models' -g
# $NODE reports -q 'call this report1\nshow report1' -g
# $NODE reports -q 'call this report1\nlist the models\ncall this report2\nshow report1 and report2' -g -d
# $NODE inspect reports -q 'call this report1\ndescribe the reports' -g -d
# $NODE events -q 'after event1 action1 event1 event1' -g -d
# $NODE reports -q 'after the report changes show the report\nmove column 2 to column 1' -g -d
# $NODE reports -q 'move column 2 to column 1' -g -d
# $NODE reports -q 'call this report1\ndescribe report1' -g -r
# $NODE inspect reports -q 'after the report changes show the report\nanswer with sentences' -g -d -r
# $NODE reports -q 'after the report changes show the report' -g -d -r
# $NODE math -q 'x times y' -g -d
# $NODE reports -q 'x is 20 show the report' -g -d
# $NODE inspect dialogues -q 'x is 20 what is it' -g -d
# $NODE inspect reports -q 'call this report1 show it' -g -d
# $NODE math -q '4 times 5' -g -d 
# $NODE inspect reports -q 'call this report1 show it' -g -d
# $NODE inspect reports -q 'call it report1 show it' -g -d
# $NODE inspect reports -q 'list the models\ncall this report1' -g -d 
# $NODE reports -q 'call this report1 show it' -g -d
# $NODE reports -q 'show the quantity descending and the price ascending' -g -d
# $NODE math -q 'x is 3 y is 4 what is x' -g -d
# $NODE inspect math -q 'what is 10 plus 2' -g -d
# $NODE dialogues -q 'x is 3 what is x' -g -d
# $NODE math -q 'x is 3 what is x' -g -d
# $NODE inspect math -q 'x is 3 y is 4 what is x what is y' -g -d
# $NODE inspect math -q 'x is 3 y is 4 what is x and y' -g -d
# $NODE reports -q 'x is 20 show the report' -g -d
# TODO $NODE reports -q 'call this report report1 show it' -g -d
# $NODE math -q 'x is 3 y is 4 x times y' -g -d
# $NODE time -q 'use 24 hour format' -g -d
# TODO $NODE properties -q 'property of object' -g -d
# $NODE inspect properties -q 'the age of greg is 23 the profession of greg is programmer what are the properties of greg' -g -d
# $NODE properties -q 'the name of greg is greg greg is readonly the name of greg is fred' -g -d
# $NODE properties -q 'what is the property of object' -g -d
# $NODE properties -q 'property of object' -g -d
# $NODE properties -q 'the cat of the sister of alice' -g -d
# $NODE avatar -q 'your name' -g -d
# $NODE dialogues -q 'x is 3 what is x' -g -d
# $NODE math -q 'price is 20 quantity is 30 worth is price times quantity what is the worth' -g -d
# $NODE hierarchy -q 'cats are animals dogs are animals' -d
# $NODE hierarchy -q 'cats are animals dogs are animals what are the types of animals' -d
# TODO $NODE reports -q 'delete the columns means remove the column
# TODO $NODE math -q 'worth is price times quantity what does worth mean?' -g -d
# TODO $NODE math -q 'worth is price times quantity what is the meaning of worth?' -g -d
# TODO $NODE math -q '20 dollars times 10' -g -d
# TODO $NODE scorekeeper -q 'what is the winning score' -g -d
# $NODE math -q 'worth is price times quantity' -d
# TODO $NODE reports -q "worth means price times quantity show the worth show the report" -d
# $NODE inspect reports -q "worthdebug means price times quantity" -d -g
# $NODE reports -q "show the worth list the models" -d
# $NODE reports -q "worthdebug is price times quantity\\nshow the worthdebug list the models" -d
# TODO $NODE math -q 'x is 3 y is 4 x*y'
# $NODE inspect math -q 'price is 6 quantity is 4 worth means price times quantity what is the worth?' -d
# $NODE reports -q "worthtest is price times quantity\\nshow the worthtest list the models" -d
# $NODE reports -q "show the worthtest list the models" -d
# $NODE inspect reports -q "worthtest is price times quantity" -d
# $NODE math -q 'worth is price times quantity price is 6 quantity is 4 what is the worth ?' -d
# BAD - this could be fixed by doing left most complete and then redoing the remaining
#       the problem is worth is not defined since the def happens on the client side
# $NODE math -q 'price is 6 worth is price times quantity quantity is 4\nwhat is the worth' -d
# $NODE math -q 'price is 6 worth is price times quantity quantity is 4 what is the worth' -d -g
# GOOD
# $NODE math -q 'price is 6 quantity is 4 worth is price times quantity what is the worth' -d
# $NODE math -q 'price is 20 quantity is 30 worth is price times quantity what is the worth' -d
# $NODE reports -q 'answer with sentences list the models' -d
# $NODE inspect people -q 'wendy owns cleo wendy owns mary what does wendy own' -d -g
# $NODE people -q 'wendy owns cleo wendy owns mary what does wendy own' -d
# $NODE people -q "cleo is a cat\nwendy owns cleo" -g -d
# $NODE people -q "wendy owns cleo" -d -g
# TODO saying the same things twice or saying the opposite
# $NODE people -q "cleo is a cat wendy owns cleo\nwho is the cat owned by wendy" -g -d
# $NODE people -q 'wendy owns cleo' -d -g
# $NODE people -q "who is the cat owned by wendy" -g -d
# $NODE inspect people -q "cleo is a cat wendy owns cleo who is the cat owned by wendy" -r
# // helpers/properties : 178
# people : 81
# call32
# hierarchy:125
# $NODE people -q "given name means first name the first name of greg is greg23 what is the given name of greg" -d
# people : 81
# $NODE people -q 'ownee23 is owned by owner23\nwho is ownee23 owned by' -d
# GOAL-0 $NODE people -q "cleo is a cat wendy owns cleo who is the cat owned by wendy" -g
# GOAL-1 $NODE people -q "who is the cat owned by wendy" -g -d
# GOAL-2 $NODE people -q "cleo is a cat\nwendy owns cleo\nwho is the cat owned by wendy" -g
# helpers/properties 367
# people 78
# $NODE people -q 'the cat owned by wendy' -g -d 
# $NODE people -q 'who is ownee23 owned by' -g -d
# $NODE people -q 'ownee23 is owned by owner23' -d -g
# $NODE people -q 'ownee23 is owned by owner23 who is ownee23 owned by' -d -g
# $NODE scorekeeper -q 'start a new game\ngreg and jeff\nwho are the players' -d
# $NODE pokemon -q 'what is the type of pikachu' -g -d
# $NODE foods -q 'what are the types of food ' -d
# $NODE foods -q 'chicken is food\nsushi is food\nwhat are the types of food' -d
# $NODE foods -q 'chicken modifies strips' -d
# $NODE foods -q 'chicken strips are food\nsushi is food\nwhat are the types of food' -d
# $NODE foods -q 'sushi is food\nwhat are the types of food' -d
# $NODE foods -q 'food' -d
# $NODE pipboy -q 'testsetup1 weapon equip that' -d
# $NODE pipboy -q 'the work outfit' -d -g
# $NODE inspect pipboy -q 'testsetup1 weapon equip that' -g -d 
# $NODE pipboy -q 'all the weapons' -g -d 
# $NODE pipboy -q 'show all the weapons' -g -d
# $NODE comparable -q 'lowest comparable' -g -d
# $NODE pipboy -q 'highest damage pistol' -g -d
# $NODE pipboy -q 'equip the highest damage pistol' -g -d
# $NODE pipboy -q 'drink a cola' -g -d
# $NODE pipboyTemplate -q "damage luck hp rads value ap charisma range accuracy are properties" -g -d
# $NODE temperature -q '10 degrees celcius in fahrenheit' -g
# $NODE temperature -q 'testingEvaluate 10 degrees celcius in fahrenheit' -g -d
# $NODE tester -m testing -q 'testingEvaluate testingValue' -d -g
# export DEBUG_OPERATOR="([dimension])"
# $NODE tester -m temperature -do "([dimension])" -q 'hi' -d -g
# $NODE testing -q 'testingEvaluate testingValue' -g -d
# $NODE tester -m temperature -tva -tmn temperature -g
# $NODE tester -m dimension -tva -tmn dimension -g
# $NODE formulas -q 'y equals 4 x = y + 10 calculate x' -g
# $NODE formulas -q 'x = 4 calculate x' -g
# $NODE math -d -q '4 + x' -g
# $NODE inspect math -d -q 'x * y + z' -g
# $NODE formulas -d -q 'y equals 4 x = y + z calculate x' -g
# $NODE formulas -d -q 'solve x = y for x' -g
# $NODE formulas -d -q 'solve x = y + 1 for x' -g
# $NODE dimension -d -q 'dimension is a concept\nlength is a dimension\n unit of length' -g
# $NODE dimension -d -q 'length is a dimension\n meter is a unit of length' -g
# $NODE dimension -d -q 'a unit of length' -g
# $NODE dimension -d -dic -q 'meter is a unit of length' -g
# $NODE dimension -d -q 'meter is a unit of length' -g
# $NODE dimension -d -q 'unit of length' -g
# $NODE dimension -d -q 'meter is a unit of length\n what are the units of length' -g
# $NODE numbers -q '2.56' -g
# $NODE length -q '1 meter 1 meter' -g -d
# $NODE math -q 'price is 20 quantity is 30 what is price times quantity' -g -d
# $NODE math -q 'price is 20 what is the price' -g -d
# $NODE inspect math -q 'price is 20' -g -d
# $NODE inspect math -q 'price is 20 quantity is 30 worth is price times quantity what is the worth' -g -d
# $NODE math -q 'price is 20 quantity is 30 worth is price times quantity what is worth' -g -d
# $NODE math -q 'worth is price times quantity' -g -d
# $NODE hierarchy -q "mccoy's rank is doctor is mccoy a doctor" -g -d
# $NODE pipboy -q 'wear a hat' -g -d
# $NODE inspect pipboyTemplate -q 'trees are treeable' -g -d
# $NODE formulas -q 'solve x = y for x' -g -d
# $NODE pipboy -q 'eat food' -g -d
# $NODE inspect reports -q 'move column 2 to column 1' -g -d
# $NODE reports -q "worthtest is price times quantity\\nshow the worthtest list the models" -g
# $NODE inspect reports -q "worthtest is price times quantity" -g -d -dl
#  $NODE tester -m properties -tva -tmn properties -g
# $NODE inspect math -q 'price is 20 quantity is 30 what is the price times the quantity' -g -d
# $NODE math -q 'price is 20 quantity is 30 what is price times quantity' -g -d
# true case
# $NODE math -q 'price is 20 quantity is 30 worth is price times quantity what is the worth' -g -d
# false case
# $NODE math -q 'the price is 20 what is the price' -g -d 
# TODO say x is a y twice or say the opposite
# TODO $NODE math -q '20 is the price what is the price' -g -d
# TODO $NODE length -q 'calculate 10 meters in inches' -g -d
# TODO $NODE math -q 'price is 20 dollars quantity is 30 what is price times quantity' -g -d
# TODO $NODE math -q 'price is 20 dollars what is the price' -g -d
# $NODE punctuation -q '(a)' -g -d
# $NODE math -q '2*(4+5)' -g -d
# $NODE dimension -q 'fahrenheit equals celcius*9/5 + 32'
# $NODE formulas -q 'fahrenheit = celcius*9/5 + 32' -g -d 
# $NODE formulas -q 'fahrenheit = celcius*9/5 + 32 the formulas for fahrenheit' -g
# $NODE inspect formulas -q 'what are the formulas for fahrenheit' -g -d
# TODO $NODE inspect formulas -q 'fahrenheit = celcius*9/5 + 32 what are the formulas for fahrenheit' -g -d
# $NODE inspect countable -q '1 countable' -g
# $NODE inspect dimension -q "temperature is a dimension\nfahrenheit celcuis and kelvin are units of temperature\nfahrenheit = celcius*9/5 + 32" -g
# $NODE inspect dimension -q "temperature is a dimension\nfahrenheit celcuis and kelvin are units of temperature" -g
# $NODE inspect dimension -q "temperature is a dimension" -g
# $NODE inspect dimension -q "what is 10 degrees celcius in fahrenheit" -g
# $NODE inspect dimension -d -q "temperature is a dimension\nfahrenheit celcuis and kelvin are units of temperature\nfahrenheit = celcius*9/5 + 32\nwhat is 10 degrees celcius in fahrenheit" -g 
# $NODE inspect time -q 'what is the time' -g -d
# $NODE inspect math -q 'price is 20 quantity is 30 what is price times quantity' -g -d
# $NODE length -q 'what is 1 meter in centimeters' -g -d
# $NODE inspect properties -q "the age of greg is 23 what is greg's age" -g -d
# $NODE inspect reports -q 'call this report1\nshow report1' -g -d
# $NODE reports -q 'call this report1' -g -d
# $NODE inspect reports -q 'call this report1\nshow it' -g -d
# $NODE numbers -q 'c1' -g
# $NODE inspect dimension -q 'c1 is a dimension\na1 and b1 are units of d1\nwhat are 10 a1 in b1\nwhat is the reason' -g -d
# $NODE inspect dimension -q 'c1 is a dimension\na1 and b1 are units of d1\nwhat are 10 a1 in b1\nwhy' -g -d 
# $NODE dialogues -q 'why' -g -d
# TODO $NODE formulas -q "1+2 is a formula" -g -d
# $NODE math -q 'an expression' -g -d
# $NODE inspect hierarchy -q 'greg is a human is greg a human' -g -d
# $NODE math -q 'is 1+2 an expression' -g -d
# $NODE properties -q "the age of greg" -g -d
# $NODE hierarchy -q 'cats and dogs are animals what are the types of animals' -g -d
# $NODE hierarchy -q 'cats and dogs are animals' -g -d
# $NODE animals -q 'do dogs have skin' -g -d
# $NODE hierarchy -q 'dogs and wolves are canines' -g -d
# $NODE inspect animals -q "birds and mammals are animals\hi" -g -d
# $NODE scorekeeper -q 'the winning score is 37 points' -g -d
# $NODE countable -q 'all countable' -g -d
# $NODE reports -q 'worthtest is price times quantity' -g -d
# $NODE dimension -q 'temperature is a dimension\nfahrenheit celcuis and kelvin are units of temperature\nfahrenheit = celcius*9/5 + 32\nwhat is 10 degrees celcius in fahrenheit' -g -d
# $NODE weight -q 'what are the dimensions' -g -d
# $NODE dimension -q 'c1 is a dimension\na1 and b1 are units of d1\nwhat are 10 a1 in b1\nwhat is the reason' -g -d
# $NODE dialogues -q 'x is 3 what is x' -g -d
# $NODE dialogues -q 'x is 3 what is x what is it' -g -d
# $NODE pokemon -q 'what type is pikachu' -g -d
# $NODE pokemon -q 'who is electric type' -g -d
# TODO $NODE weight -q 'what are the weights' -g -d
# TODO $NODE weight -q 'what are the different types of weights' -g -d
# TODO $NODE temperature -q 'what is 10 degrees celcuis in fahrenheit that in kelvin' -g -d
# $NODE weight -q 'what is 1 troy ounce in ounces' -g -d
# $NODE weight -q '1 troy ounce in ounces' -g -d
# $NODE weight -q '1 troy ounce' -g -d -dic
# $NODE weight -q '"kilograms grams pounds troy ounces ounces and tons are units of weight"' -g -d -daa
# $NODE weight -q '(troy ounces) and ounces are units of weight"' -g -d -daa
# $NODE weight -q 'troy ounces and ounces' -g -d -daa
# $NODE weight -q '(troy ounces) and ounces' -g -d -daa
# $NODE weight -q 'troy ounces' -g -d -daa
# $NODE weight -q '(troy ounces) and ounces' -g -d -daa
# $NODE weight -q 'kilos (troy ounces) and ounces' -g -d -daa
# $NODE people -q 'given name means first name the first name of greg is greg23 what is the given name of greg' -g -d -daa
# $NODE people -q 'the first name of greg is greg23 what is the given name of greg' -g -d -daa
# $NODE people -q 'the first name of greg is greg23' -g -d -daa
# $NODE people -q 'what is the given name of greg' -g -d -daa
# TODO $NODE weight -q 'kilos troy ounces and ounces' -g -d -daa
# $NODE weight -q 'what is 1 ounce in troy ounces' -g -d 
# $NODE weight -q 'troy ounces = ounces / 1.097' -g -d -daa
# $NODE weight -q 'ounces = 1.097 * troy ounces' -g -d -daa
# $NODE math -q 'worth is price times quantity' -g -d -daa -dic
# $NODE weight -q 'what is 1 troy ounce in ounces' -g -d
# $NODE weight -q 'what is 1 ounce in troy ounces' -g -d
# $NODE weight -q '1.097 * troy ounces' -g -d -daa --parenthesized
# $NODE reports -q 'show the worth' -g -d -daa
# $NODE reports -q 'worth means price times quantity' -g -d -daa --parenthesized
# $NODE reports -q 'show the quantity descending and the price ascending list the products' -g -d -daa 
# $NODE time_dimension -q 'what is 120 seconds in minutes' -g -d
# $NODE time_dimension -q 'what is 2 minutes in seconds' -g -d
# $NODE time_dimension -q 'what is 120 seconds in seconds' -g -d
# $NODE length -q "what is 36 inches in feet" -g -d
# $NODE properties -q "alice's sister's cat" -g -d -daa --parenthesized
# $NODE properties -q "alice's cat" -g -d -daa --parenthesized
# $NODE weight -q "the weight of greg is 213 pounds what is greg's weight" -g -d
# $NODE weight -q "what is greg's weight" -g -d
# $NODE weight -q "the weight of greg is 213 pounds what is greg's weight in kilograms" -g -d
# $NODE weight -q "what is greg's weight in kilograms" -g -d # --parenthesized
# $NODE time_dimension -q "10:05 pm" -g -d
# TODO $NODE time_dimension -q "what is the time" -g -d
# $NODE hierarchy -q 'fruit is food what are the types of food' -g -d
# $NODE hierarchy -q 'apples are fruit fruit is food what are the types of food' -g -d
# $NODE hierarchy -q 'x is 20 what is x' -g -d
# $NODE hierarchy -q 'fruits are food what are the types of food' -g -d
# TODO $NODE fastfood -q 'more modifies food' -g -d
# TODO $NODE fastfood -q 'more modifies big mac' -g -d
# $NODE properties -q 'the age of greg is 23 the profession of greg is programmer what are the properties of greg' -g -d
# $NODE weight -q "kilograms grams pounds (troy ounces) ounces and tons are units of weight" -g -d --parenthesized -daa
# $NODE fastfood -q "baconater and bacon deluxe are hamburgers" -g -d --parenthesized -daa
# TODO infinite loop $NODE fastfood -q 'hamburger modifies combo\nsingle combo' -g -d
# $NODE fastfood -q "single and double modifies combo" -g -d --parenthesized -daa
# $NODE tester -m people -tva -tmn people -g
# $NODE tester -m people -tmn people -g -q 'greg owns x what does greg own'
# $NODE tester -m fastfood -tva -tmn fastfood -g
# $NODE tester -m time -tva -tmn time -g
# $NODE tester -m time -tmn time -g -q "tell me when the time is 2 pm"
# $NODE tester -m crew -tva -tmn crew -g
# $NODE tester -m crew -tmn crew -g -q 'arm the phasers' -d
# $NODE characters -tva -g
# $NODE tester -m reports -tva -tmn reports -g
# $NODE tester -m fastfood -tva -tmn fastfood -g
# $NODE tester -m fastfood -tmn fastfood -g -q '2 french fries' -d
# $NODE fastfood -q 'show the order' -g -d
# $NODE concept -q 'ice and hand modify cream' -g -d
# $NODE concept -q 'ice and hand modify cream\n ice cream hand cream' -g -d
# TODO $NODE concept -q 'ice and hand modify cream ice cream hand cream' -g -d
# TODO $NODE concept -q 'ice and sour modify cream\n ice and sour cream' -g -d
# $NODE fastfood -q '"single double triple baconater bacon deluxe spicy homestyle and premium cod are meals"' -g -d
# $NODE pipboy -q 'put on the city outfit' -g -d
# $NODE pipboy -q 'the stats tab' -g -d
# $NODE reports -q 'after the report changes show the report\nanswer with sentences' -g -d
# $NODE fastfood -q 'double combo' -g -d
# $NODE fastfood -q '2 double combo' -g -d
# $NODE fastfood -q 'single and double combo' -g -d
# $NODE fastfood -q '2 double combos one with coke and one with sprite' -g -d
# $NODE fastfood -q '2 double combos one with sprite and coke' -g -d
# $NODE pipboy -q 'the city outfit' -g -d --parenthesized
# $NODE weight -q 'kilos (troy ounces) and ounces' -g -d --parenthesized
# $NODE tester -m scorekeeper -q 'start a new game 100 points' -tmn scorekeeper -g
# $NODE tester -m scorekeeper -tva -tmn scorekeeper -g
# $NODE tester -m fastfood -tva -tmn fastfood -g
# $NODE tester -m fastfood -q '2 french fries' -g -d
# $NODE fastfood -q '2 french fries' -g -d
# this had the server side bug $NODE fastfood -q 'single and double combo' -g -d
# $NODE fastfood -q '2 double combos' -g -d
#$NODE fastfood -q 'double combo' -g -d
# $NODE fastfood -q 'combo one and two' -g -d
# $NODE fastfood -q '2 double combos' -g -d
# $NODE fastfood -q 'combo one and combo two' -g -d
# $NODE fastfood -q 'number one combo' -g -d
# $NODE fastfood -q 'combo one combo two and combo three' -g -d
# $NODE fastfood -q 'combo one and combo two and three' -g -d
# $NODE fastfood -q 'combo one' -g -d
# $NODE fastfood -q 'number one' -g -d
# $NODE fastfood -q 'combo one and two combo twos' -g -d
# $NODE fastfood -q '(combo one) and (two combo twos)' -g -d
# $NODE fastfood -q 'two combo ones' -g -d
# $NODE fastfood -q 'number one' -g -d
# $NODE fastfood -q 'number one and two' -g -d
# $NODE fastfood -q 'two combo number ones' -g -d -r
# $NODE fastfood -q 'one number one combo' -g -d --parenthesized
# $NODE fastfood -q 'one number one' -g -d
# $NODE fastfood -q 'combo number one and two' -g -d
# node reports -q 'answer with sentences list the models' -g -d
# $NODE fastfood -q '2 french fries' -g -d
# node concept -q 'raw chicken modifies strips\n raw chicken strips' -d -g
# node fastfood -q "spicy homestyle (asiago ranch chicken club) (10 piece nuggets) (ultimate chicken grill) and (premium cod) are sandwiches" -g -d -daa
# node fastfood -q "spicy homestyle (asiago ranch chicken club) (ultimate chicken grill) and (premium cod) are sandwiches" -g -d -daa
# node fastfood -q "spicy homestyle asiago ranch chicken club ultimate chicken grill and premium cod are sandwiches" -g -d -daa
# $NODE properties -q 'xfx between a1 and a2' -g -d
# $NODE formulas -q 'fahrenheit = celcius*(9/5) + 32' -g -d
# $NODE fastfood -q 'single and double combo' -g -d --parenthesized -dic
# $NODE fastfood -q 'combo one and two' -g -d --parenthesized
# $NODE fastfood -q 'number one and two' -g -d --parenthesized -cl
# $NODE fastfood -q 'double combo' -g -d --parenthesized -dic comboMeal $@
# $NODE fastfood -q 'single double triple baconater and bacon deluxe are hamburgers' -g -d $@
# $NODE fastfood -q 'single double triple baconater bacon deluxe spicy homestyle and premium cod are meals' -g -d $@
# $NODE fastfood -q 'double combo' -g -d $@
# $NODE inspect fastfood -q 'combo one and two' -g -d $@
# $NODE fastfood -q 'combo one and two' -g -d -cl '[["list", 0]]' 
# $NODE fastfood -q 'single double triple baconater bacon deluxe spicy homestyle and premium cod are meals' -g -d -cl '[["list", 0]]' 
# $NODE fastfood -q 'number one and two' -g -d -cl '[["list", 0]]'
# $NODE fastfood -q 'combo number one and two' -g -d -cl '[["list", 0]]'
# $NODE fastfood -q 'combo one and two combo twos' -g -d -cl '[["list", 0]]'
# $NODE fastfood -q 'single combo' -g -d -cl '[["list", 0]]'
# $NODE fastfood -q '3 single and 2 double combos' -g -d -cl '[["list", 0]]' 
# $NODE fastfood -q '2 french fries' -g -d -cl '[["list", 0]]'
# $NODE pipboy -q 'apply 10 stimpacks' -g -d -cl '[["list", 0]]'
# $NODE fastfood -q '2 combo ones' -g -d -cl '[["list", 0]]'
# $NODE fastfood -q '2 french fries and 3 waffle fries' -g -d -daa -cl '[["list", 0]]'
# $NODE fastfood -q 'combo 1 with waffle fries' -g -d -daa -cl '[["list", 0]]'
# $NODE concept -q 'mango modifies passion\nmango passion modifies smoothie\nmango passion smoothie' -g -d
# DEBUG_OPERATOR="([mango_passion|])" $NODE concept -q 'mango modifies passion\nmango passion modifies smoothie' -g -d -po
# $NODE fastfood -q "strawberry guava mango passion wild berry and strawberry banana modify smoothie" -g -d -daa -cl '[["list", 0]]' --parenthesized
# $NODE fastfood -q "a smoothie" -g -d -daa -cl '[["list", 0]]'
# $NODE fastfood -q "2 bananas" -g -d -daa -cl '[["list", 0]]'
# $NODE fastfood -q "2 bananas and (combo 1)" -g -d -daa -cl '[["list", 0]]' 
# $NODE fastfood -q "2 french fries and 3 waffle fries" -g -d -daa -cl '[["list", 0]]' 
# $NODE fastfood -q "3 singles and 2 double combos" -g -d -daa -cl '[["list", 0]]' 
# number (1 and 2)
# (2 french fries) and (3 waffle fries) NOT (2 french fries and 3) (waffle fries)
# (2 french fries) and (waffle fries)
#               instance by type
#               associations
#               contextual priorities learned from parenthesized
# $NODE fastfood -q "two combo ones" -g -d -daa -cl '[["list", 0]]'
# $NODE weight -q 'kilograms grams pounds (troy ounces) ounces and tons are units of weight' -g -d
# $NODE fastfood -q "combo one and two combo twos" -g -d
#$NODE fastfood -q 'combo one and two combo twos' -g -d
# $NODE fastfood -q '(single and double) combo' -g -d
# $NODE fastfood -q 'combo one and combo two and three' -g -d --parenthesized
# $NODE fastfood -q 'combo one and two combo twos' -g -d --parenthesized -dic '["countable"]'
# $NODE fastfood -q 'single and double combo' -g -d --parenthesized
# $NODE fastfood -q ' combo one and two combo twos' -g -d --parenthesized -cl '[["list", 0]]'
# TODO $NODE fastfood -q "a strawberry and guava smoothie" -g -d -daa -cl '[["list", 0]]' --parenthesized
# TODO $NODE fastfood -q "a strawberry and a guava smoothie" -g -d -daa -cl '[["list", 0]]' --parenthesized
# TODO $NODE fastfood -q "(a strawberry and a guava) smoothie" -g -d -daa -cl '[["list", 0]]' --parenthesized
# TODO $NODE fastfood -q "a strawberry and guava smoothie" -g -d -daa -cl '[["list", 0]]' --parenthesized
# $NODE fastfood -q "(a strawberry and guava) smoothie" -g -d -daa -cl '[["list", 0]]' --parenthesized
# $NODE fastfood -q "a mango passion smoothie" -g -d -daa -cl '[["list", 0]]' --parenthesized
# $NODE fastfood -q "2 mango passion smoothies" -g -d -daa -cl '[["list", 0]]' -dic counting
# $NODE fastfood -q "3 strawberry smoothies" -g -d -daa -cl '[["list", 0]]'
# $NODE fastfood -q "(2 mango passion and 3 strawberry) smoothies" -g -d -daa -cl '[["list", 0]]'
# $NODE fastfood -q "(2 mango passion and (3 strawberry)) smoothies" -g -d -daa -cl '[["list", 0]]'
# $NODE fastfood -q "2 mango passion smoothies and 3 strawberry smoothies" -g -d -daa -cl '[["list", 0]]' --parenthesized
# $NODE fastfood -q "2 mango passion and 3 strawberry smoothies" -g -d -daa -cl '[["list", 0]]' --parenthesized
# $NODE fastfood -q "spicy homestyle asiago ranch chicken club 10 piece nuggets ultimate chicken grill and premium cod are sandwiches" -g -d -daa -cl '[["list", 0]]' --parenthesized
# $NODE fastfood -q "spicy homestyle asiago ranch chicken club ultimate chicken grill and premium cod are sandwiches" -g -d -daa -cl '[["list", 0]]' --parenthesized
# $NODE fastfood -q "combo one and two" -g -d -daa -cl '[["list", 0]]' --parenthesized
# $NODE fastfood -q "number one and two" -g -d -daa -cl '[["list", 0]]' --parenthesized
# $NODE fastfood -q "combo one and (two combo twos)" -g -d -daa -cl '[["list", 0]]' --parenthesized
# $NODE fastfood -q "(combo one) and (two combo twos)" -g -d -daa -cl '[["list", 0]]' --parenthesized
# $NODE fastfood -q "(2 mango passion and (3 strawberry)) smoothies" -g -d -daa -cl '[["list", 0]]' --parenthesized
# $NODE fastfood -q "2 mango passion and 3 strawberry smoothies" -g -d -daa -cl '[["list", 0]]' --parenthesized
# $NODE fastfood -q "combo one and two combo twos" -g -d -daa -cl '[["list", 0]]' --parenthesized
# TODO ask for smoothie it replies which ones. they are the flavours... expectation for smooth
# $NODE fastfood -q "hamburger\ncombo 1" -g -d -daa -cl '[["list", 0]]'
# $NODE tester -m fastfood -tva -tmn fastfood -g
# $NODE tester -m fastfood -q 'combo 1 with waffle fries' -g -d
# $NODE fastfood -q 'combo 1 with waffle fries' -g -d 
# $NODE fastfood -q 'combo 1 with a guava smoothie' -g -d
#$NODE fastfood -q 'combo 1 with waffle fries and a guava smoothie' -g -d
#$NODE fastfood -q 'a large guava smoothie' -g -d --parenthesized
# $NODE fastfood -q 'spicy modifies caesar salad' -g -d --parenthesized -po
# $NODE fastfood -q 'spicy modifies caesar salad\nspicy caesar salad' -g -d --parenthesized
# $NODE countable -q '2 piece hasCountOfPieces' -g -d
# $NODE countable -q '10 2 piece hasCountOfPieces' -g -d --parenthesized
# $NODE edible -q '2 piece nuggets' -g -d
# $NODE edible -q '5 2 piece nuggets' -g -d
# $NODE fastfood -q '3 10 piece chicken nuggets' -g -d
# $NODE fastfood -q "breakfast baconator, french toast sandwich, egg muffin, chicken on french toast, pancake platter, double sausage muffin, pancakes, french toast and oatmeal are breakfast meals" -g -d
# $NODE countable -q '1 countable' -g -d
# $NODE pipboy -q 'equip the highest damage pistol' -g -d
# $NODE fastfood -q 'french toast sandwich combo' -g -d
# $NODE fastfood -q 'broccoli and cheddar modifies potato\nbroccoli and cheddar potato' -g -d
# $NODE fastfood -q 'broccoli and cheddar modifies potato' -g -d
# $NODE concept -q 'apple and cheddar literally modifies pie\napple and cheddar pie' -g -d
# $NODE concept -q 'apple and cheddar literally modifies pie' -g -d -pw
# $NODE fastfood -q 'chicken go wrap' -g -d -cl '[["chicken_go_wrap", 0]]' 
# $NODE fastfood -q 'chicken go wrap' -g -d
# $NODE fastfood -q 'broccoli and cheddar literally modifies potato\nbroccoli and cheddar potato' -g -d -po -dic broccoli_list_cheddar_potato
# $NODE fastfood -q 'broccoli and cheddar potato' -g -d -dic broccoli_list_cheddar_potato
# $NODE fastfood -q 'combo one and two combo twos' -g -d
# $NODE fastfood -q 'single and double combo' -g -d --parenthesized
# $NODE fastfood -q '2 mango passion and 3 strawberry smoothies' -g -d --parenthesized -cl '[["strawberry_smoothie", 0]]' 
# $NODE fastfood -q '(2 mango passion and 3 strawberry) smoothies' -g -d --parenthesized
# $NODE fastfood -q '2 mango passion and 3 strawberry smoothies' -g -d
# $NODE fastfood -q 'strawberry, guava, mango passion, wild berry and strawberry banana modify smoothie' -g -d --parenthesized -cl '[["strawberry_banana", 0]]' 
# $NODE fastfood -q 'strawberry, guava, mango passion, wild berry and strawberry banana modify smoothie' -g -d --parenthesized
# $NODE fastfood -q 'bacon and cheddar potato' -g -d
# $NODE fastfood -q 'kids hamburger' -g -d
# $NODE fastfood -q 'hamburgers, cheeseburgers, crispy chicken and nuggets are kids meals' -g -d
# $NODE concept -q 'kids modifies meal\nkids meal' -g -d
# $NODE concept -q 'kids modifies meal' -g -d
# $NODE fastfood -q 'nuggets, junior bacon cheeseburgers, chicken go wraps and junior crispy chicken clubs are value meals' -g -d
# $NODE fastfood -q 'junior modifies crispy chicken club' -g -d
# $NODE fastfood -q 'chicken go wraps and junior crispy chicken clubs are value meals' -g -d -cl '[["is", 0]]' 
# $NODE fastfood -q 'hi' -g -d -cl '[["is", 0]]' 
# $NODE fastfood -q 'chicken go wraps are value meals' -g -d
# $NODE concept -q 'mango modifies passion\nmango passion modifies smoothie\nmango passion smoothie' -g -d
# $NODE edible -q "nuggets, chicken strips and chicken nuggets are food" -g -d --parenthesized -cl
# $NODE fastfood -q "single and double combo" -g -d
# $NODE fastfood -q "junior crispy chicken club" -g -d
# $NODE fastfood -q "nuggets, junior bacon cheeseburgers, chicken go wraps and junior crispy chicken clubs are value meals" -g -d
# $NODE fastfood -q "chicken go wraps and junior crispy chicken clubs are value meals" -g -d -cl
# node fastfood -q 'junior bacon cheeseburger' -g -d
# TODO node fastfood -q 'junior bacon cheeseburger combo' -g -d
# node fastfood -q 'large chili' -g -d
# node fastfood -q 'breakfast baconator' -g -d
# $NODE fastfood -q 'combo 1\ncoca cola' -g -d
# $NODE dialogues -q 'what is the worth' -g -d
# $NODE fastfood -q '2 combo ones\nsprite\nbarqs' -g -d
# $NODE  fastfood -q '2 combo ones\nsprite\nfanta' -g -d
# $NODE  fastfood -q '2 combo ones\nsprite and fanta' -g -d
# $NODE fastfood -q '2 combo ones\n2 sprites' -g -d
# $NODE fastfood -q '2 combo ones\nsprites' -g -d
# $NODE fastfood -q '2 bananas\ncombo 1\nfanta' -g -d
# $NODE fastfood -q 'combo 1\n2 bananas\nfanta' -g -d
# $NODE fastfood -q '2 bananas' -g -d
# $NODE fastfood -q 'combo 1 with sprite' -g -d
# $NODE fastfood -q 'combo 1 with large sprite' -g -d
# $NODE fastfood -q 'combo 1 with waffle fries' -g -d
# $NODE tester -m fastfood -q '2 bananas' -tmn fastfood -g
# $NODE tester -m fastfood -tva -tmn fastfood -g
# $NODE fastfood -q 'combo 2 and 2 combo threes\n2 sprites and a fanta' -g -d
# $NODE fastfood -q 'a guava and strawberry banana smoothie' -g -d
# $NODE fastfood -q '2 10 piece chicken nuggets' -g -d
# $NODE fastfood -q 'combo 1 with waffle fries and a guava smoothie' -g -d
# $NODE fastfood -q '2 sprites and a fanta' -g -d
# $NODE fastfood -q 'combo 1 with waffle fries and a guava smoothie' -g -d
# nuggets, junior bacon cheeseburgers, chicken go wraps and junior crispy chicken clubs are value meals
# TODO $NODE weight -q '(troy ounces) and ounces' -g -d

# combo 1 with waffle fries and a guava smoothie
# 2 sprites and a fanta
# combo 1 with waffle fries and a guava smoothie
# nuggets, junior bacon cheeseburgers, chicken go wraps and junior crispy chicken clubs are value meals
# $NODE fastfood -q 'combo 1 and combo 2' -g -d
# $NODE fastfood -q 'combo 1 with waffle fries and a guava smoothie' -g -d
# $NODE fastfood -q 'combo one and combo two and three' -g -d
# $NODE fastfood -q '(2 mango passion and (3 strawberry)) smoothies' -g -d
# $NODE weight -q '(troy ounces) and ounces' -g -d
# $NODE time -q 'what is the time' -g -d
# $NODE length -q 'what is 36 inches in feet' -g -d
# $NODE avatar -q 'my name is greg what is my name' -g -d
# $NODE length -q 'what is 10 centimeters in centimeters' -g -d
# $NODE formulas -q 'fahrenheit = celcius*(9/5) + 32 what are the formulas for fahrenheit' -g -d
# $NODE math -q '4 + x' -g -d
# $NODE pokemon -q 'what type is pikachu' -g -d
# $NODE avatar -q 'your name is greg what is your name' -g -d
# $NODE edible -q 'what are the types of food' -g -d
# $NODE weight -q 'what is 10 pounds in kilograms' -g -d
# $NODE pipboy -q ' what are the types of item properties' -g -d
# TODO $NODE fastfood -q 'combo 1 and a smoothie' -g -d
# TODO $NODE fastfood -q 'combo 1 with a smoothie' -g -d
# $NODE fastfood -q 'combo 1 with a banana' -g -d
# TODO node fastfood -q 'combo 1 with combo 2' -g -d
# $NODE fastfood -q 'combo 1 with iced tea and combo 2 with fanta' -g -d
# $NODE fastfood -q 'combo 1 and a guava smoothie' -g
# $NODE fastfood -q 'combo 1 with a guava smoothie' -g
# change combo 1 to combo 2
# change the sprite to coke
# $NODE fastfood -q 'combo 1 with iced tea change combo 1 to combo 2' -g -d
# $NODE fastfood -q 'combo 1 with iced tea change combo 1 to combo 2' -g -d
# $NODE fastfood -q 'combo 1 with iced tea change the drink to sprite' -g -d
# $NODE fastfood -q 'combo 1 with iced tea change the combo to combo 2' -g -d
# $NODE fastfood -q 'combo 1 with iced tea change it to combo 2' -g -d
# change the double combo to a baconator combo
# add waffle fries
# remove waffle fries
# waffle fries instead
# $NODE fastfood -q 'a large sprite change the pop to coke' -g -d
# $NODE fastfood -q 'a large sprite change the drink to coke' -g -d
# $NODE dialogues -q 'x is 3 what is x' -g -d
# $NODE math -q 'the price is 20 what is the price' -g -d
# $NODE reports -q 'call this report1\nshow report1' -g -d
# $NODE reports -q 'call this report1\nshow it' -g -d
# $NODE fastfood -q 'combo 1 with iced tea change the drink to coke' -g -d
# $NODE tester -m pipboy -tva -tmn pipboy -g
$NODE tester -m fastfood -tva -tmn fastfood -g
# $NODE tester -m pipboy -tva -tmn pipboy -g
# $NODE tester -m fastfood -tmn fastfood -g -q 'a large sprite change the drink to coke' -d
