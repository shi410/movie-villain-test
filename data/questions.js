const questions = [
  {
    text: "庆功宴上，灯光打在台中央。这个项目最难的部分明明是你熬夜扛下来的，但被感谢的人不是你。那个人站在掌声里，说着“我们一起努力”，还朝你举了举杯。最刺痛你的不是没被夸，而是他们真的可以享受你的付出，再把你从故事里删掉。\n\n你最接近哪种反应？",
    options: [
      {
        text: "我要让他们重新明白，少了我，他们连台都站不上去。",
        primary: "homelander",
        scores: {
          homelander: 2,
          light: 1
        }
      },
      {
        text: "既然他们爱看表演，那我就让这场体面烂给他们看。",
        primary: "joker",
        scores: {
          joker: 2,
          pain: 1
        }
      },
      {
        text: "下一次，证据、流程、话语权都在我手里，他别想再伸手。",
        primary: "miranda",
        scores: {
          miranda: 2,
          hannibal: 1
        }
      },
      {
        text: "他们笑吧，总有一次我要把结果砸到他们脸上。",
        primary: "plankton",
        scores: {
          plankton: 2,
          homelander: 1
        }
      }
    ]
  },
  {
    text: "你进入一个新团队。大家表面友好，但暗地里已经分好圈层、利益和上下级。你很快意识到，真正的规则不写在制度里，而藏在每个人说话的停顿、眼神和站位里。\n\n你会怎么让自己站稳？",
    options: [
      {
        text: "先观察谁真正有权，再决定该靠近谁、利用谁。",
        primary: "tbag",
        scores: {
          tbag: 2,
          makima: 1
        }
      },
      {
        text: "我会用专业能力压住场面，让他们知道标准在哪。",
        primary: "miranda",
        scores: {
          miranda: 2,
          light: 1
        }
      },
      {
        text: "我会温柔地记住每个人缺什么，再一点点建立影响力。",
        primary: "makima",
        scores: {
          makima: 2,
          hannibal: 1
        }
      },
      {
        text: "我不急着融入，我先弄清这套规则到底荒谬在哪里。",
        primary: "anton",
        scores: {
          anton: 2,
          joker: 1
        }
      }
    ]
  },
  {
    text: "你最信任的人突然冷淡了。消息回得很慢，语气也变短。对方说只是最近太累，但你隐隐感觉，关系里有什么东西正在从你手里滑走。\n\n你第一反应更像哪一种？",
    options: [
      {
        text: "我要确认自己是不是还重要，哪怕方式有点过分。",
        primary: "homelander",
        scores: {
          homelander: 2,
          harley: 1
        }
      },
      {
        text: "我会更热烈一点，直到对方重新回应我。",
        primary: "harley",
        scores: {
          harley: 2,
          gollum: 1
        }
      },
      {
        text: "我会忍不住反复想这段关系是不是已经不属于我了。",
        primary: "gollum",
        scores: {
          gollum: 2,
          harley: 1
        }
      },
      {
        text: "我会后退一步，看看对方的冷淡是真实还是策略。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          makima: 1
        }
      }
    ]
  },
  {
    text: "一个人犯了错，却靠哭、解释和装可怜逃过了后果。周围人开始替他说话，仿佛只要他足够脆弱，所有规则都可以临时失效。\n\n你心里最强烈的声音是？",
    options: [
      {
        text: "规则不是用来给会哭的人让路的。",
        primary: "anton",
        scores: {
          anton: 2,
          miranda: 1
        }
      },
      {
        text: "如果所有人都不敢判，那我来判。",
        primary: "light",
        scores: {
          light: 2,
          anton: 1
        }
      },
      {
        text: "软弱不该成为免死金牌，做错就要付代价。",
        primary: "pain",
        scores: {
          pain: 2,
          light: 1
        }
      },
      {
        text: "我会记住他这一套，下次必要时也能派上用场。",
        primary: "tbag",
        scores: {
          tbag: 2,
          hannibal: 1
        }
      }
    ]
  },
  {
    text: "你终于拿到了一个梦寐以求的机会，但这个机会要求你牺牲休息、关系和一些原本很珍贵的东西。别人提醒你不要太拼，可你知道这可能是翻身的入口。\n\n你更可能怎么想？",
    options: [
      {
        text: "能爬上去的人，没资格嫌路太冷。",
        primary: "miranda",
        scores: {
          miranda: 2,
          light: 1
        }
      },
      {
        text: "只要能证明我不是失败者，我可以再赌一次。",
        primary: "plankton",
        scores: {
          plankton: 2,
          tbag: 1
        }
      },
      {
        text: "机会是给能承担代价的人，不是给犹豫的人。",
        primary: "light",
        scores: {
          light: 2,
          miranda: 1
        }
      },
      {
        text: "我会先判断这个机会能不能让我活得更稳，而不是更好看。",
        primary: "tbag",
        scores: {
          tbag: 2,
          anton: 1
        }
      }
    ]
  },
  {
    text: "你发现自己一直放不下某个人、某件事或某个目标。它让你痛苦，也让你反复回头。理智告诉你该走了，但情绪像一只手，把你拖回原地。\n\n你最像哪种状态？",
    options: [
      {
        text: "我知道它在毁掉我，但没有它，我不知道自己是谁。",
        primary: "gollum",
        scores: {
          gollum: 2,
          harley: 1
        }
      },
      {
        text: "我可以离开，但我必须先让它知道我有多痛。",
        primary: "joker",
        scores: {
          joker: 2,
          gollum: 1
        }
      },
      {
        text: "我不想输给这段执念，所以我会继续证明自己。",
        primary: "plankton",
        scores: {
          plankton: 2,
          homelander: 1
        }
      },
      {
        text: "我会慢慢切断它对我的影响，但不会让自己看起来狼狈。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          anton: 1
        }
      }
    ]
  },
  {
    text: "你被要求带一个能力很差但态度很好的新人。对方很努力，也很感激你，可他反复犯低级错误，拖慢进度，还让你不得不替他收拾残局。\n\n你最真实的想法是？",
    options: [
      {
        text: "努力不是结果，态度也不能替代能力。",
        primary: "miranda",
        scores: {
          miranda: 2,
          anton: 1
        }
      },
      {
        text: "如果他听话，我可以教；如果不听话，就没有价值。",
        primary: "makima",
        scores: {
          makima: 2,
          miranda: 1
        }
      },
      {
        text: "我会看清他的弱点，再决定他适合被放在哪里。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          makima: 1
        }
      },
      {
        text: "我会让他知道，拖累别人也是一种错误。",
        primary: "light",
        scores: {
          light: 2,
          miranda: 1
        }
      }
    ]
  },
  {
    text: "你站在一个混乱的房间里。所有人都在吵，每个人都说自己有理。规则、情感、利益、旧账搅在一起，没有人愿意停下来听别人说完。\n\n你更想做什么？",
    options: [
      {
        text: "把混乱推到极致，让他们看清这套体面本来就很烂。",
        primary: "joker",
        scores: {
          joker: 2,
          pain: 1
        }
      },
      {
        text: "建立一个不能被情绪打断的规则，然后照规则处理。",
        primary: "anton",
        scores: {
          anton: 2,
          light: 1
        }
      },
      {
        text: "找到所有人真正害怕失去的东西，局面自然会安静。",
        primary: "makima",
        scores: {
          makima: 2,
          hannibal: 1
        }
      },
      {
        text: "让他们都尝一遍后果，光讲道理没人会记住。",
        primary: "pain",
        scores: {
          pain: 2,
          joker: 1
        }
      }
    ]
  },
  {
    text: "如果你拥有一种没人能制约你的力量，你最担心自己会变成什么样？",
    options: [
      {
        text: "我会越来越需要所有人认可我、崇拜我、不能离开我。",
        primary: "homelander",
        scores: {
          homelander: 2,
          makima: 1
        }
      },
      {
        text: "我会开始相信，既然我更聪明，那我就更有资格决定一切。",
        primary: "light",
        scores: {
          light: 2,
          hannibal: 1
        }
      },
      {
        text: "我会把惩罚包装成必要代价，甚至觉得自己在拯救世界。",
        primary: "pain",
        scores: {
          pain: 2,
          light: 1
        }
      },
      {
        text: "我会不再解释，只让规则和结果替我说话。",
        primary: "anton",
        scores: {
          anton: 2,
          miranda: 1
        }
      }
    ]
  },
  {
    text: "你很讨厌一种人：他们看起来体面、正确、讲道理，但其实从来没有真正理解过你的痛苦。他们会劝你放下，却没有承受过你承受的东西。\n\n你最想对他们说什么？",
    options: [
      {
        text: "没痛过的人，别急着教我怎么善良。",
        primary: "pain",
        scores: {
          pain: 2,
          joker: 1
        }
      },
      {
        text: "你们不是理性，你们只是站在安全的地方说漂亮话。",
        primary: "joker",
        scores: {
          joker: 2,
          pain: 1
        }
      },
      {
        text: "理解痛苦不靠安慰，靠让他们亲自看见代价。",
        primary: "anton",
        scores: {
          anton: 2,
          pain: 1
        }
      },
      {
        text: "他们的话不重要，重要的是谁能在这套局里活下来。",
        primary: "tbag",
        scores: {
          tbag: 2,
          joker: 1
        }
      }
    ]
  },
  {
    text: "你喜欢一个人时，最容易掉进哪种危险？",
    options: [
      {
        text: "我会把对方变成世界中心，对方一冷我就失控。",
        primary: "harley",
        scores: {
          harley: 2,
          homelander: 1
        }
      },
      {
        text: "我会想给对方想要的一切，然后让他越来越离不开我。",
        primary: "makima",
        scores: {
          makima: 2,
          harley: 1
        }
      },
      {
        text: "我会抓得太紧，明知道痛也舍不得松手。",
        primary: "gollum",
        scores: {
          gollum: 2,
          harley: 1
        }
      },
      {
        text: "我会看穿对方的软肋，却不一定愿意放过那些软肋。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          makima: 1
        }
      }
    ]
  },
  {
    text: "你正在竞争一个位置。对手比你更受欢迎，资源更多，人缘也更好。你知道自己不比他差，但现实就是所有优势都在他那里。\n\n你会怎么处理这种不甘？",
    options: [
      {
        text: "我会反复尝试，失败多少次都不能说明我该放弃。",
        primary: "plankton",
        scores: {
          plankton: 2,
          tbag: 1
        }
      },
      {
        text: "我会找到他最依赖的资源，然后让优势变成弱点。",
        primary: "tbag",
        scores: {
          tbag: 2,
          light: 1
        }
      },
      {
        text: "我会用更高标准碾过去，让喜欢不再重要。",
        primary: "miranda",
        scores: {
          miranda: 2,
          homelander: 1
        }
      },
      {
        text: "我会让所有人看见，他被捧上去只是因为没人拆穿。",
        primary: "joker",
        scores: {
          joker: 2,
          plankton: 1
        }
      }
    ]
  },
  {
    text: "一个人向你求助。他很脆弱、很依赖你，也明显把你当成唯一的救命稻草。你知道自己可以帮他，也知道这种依赖会让你拥有很大影响力。\n\n你心里最危险的念头是？",
    options: [
      {
        text: "只要他听话，我可以给他想要的安全感。",
        primary: "makima",
        scores: {
          makima: 2,
          homelander: 1
        }
      },
      {
        text: "他会把我当成特别的人，这种感觉很难拒绝。",
        primary: "homelander",
        scores: {
          homelander: 2,
          makima: 1
        }
      },
      {
        text: "我能看见他为什么会这样，也能看见怎么让他更暴露。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          makima: 1
        }
      },
      {
        text: "如果他有用，我会留下他；如果只会拖累，就算了。",
        primary: "tbag",
        scores: {
          tbag: 2,
          miranda: 1
        }
      }
    ]
  },
  {
    text: "你被人公开羞辱了。对方用玩笑的方式让全场都笑起来，好像只要大家都笑，你就不能认真生气。那一刻你感到自己被放在台上消费。\n\n你最接近哪种反应？",
    options: [
      {
        text: "那我就把这场玩笑变成所有人的噩梦。",
        primary: "joker",
        scores: {
          joker: 2,
          homelander: 1
        }
      },
      {
        text: "我会记住这笔账，等他最放松的时候再还。",
        primary: "tbag",
        scores: {
          tbag: 2,
          anton: 1
        }
      },
      {
        text: "我会用更漂亮的方式让他知道，谁才是低级的那个。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          miranda: 1
        }
      },
      {
        text: "他让我痛，我会让他也明白什么叫痛。",
        primary: "pain",
        scores: {
          pain: 2,
          joker: 1
        }
      }
    ]
  },
  {
    text: "你最害怕别人怎么看你？",
    options: [
      {
        text: "他们觉得我没那么重要，随时可以被替代。",
        primary: "homelander",
        scores: {
          homelander: 2,
          plankton: 1
        }
      },
      {
        text: "他们觉得我只是个失败者，努力也很可笑。",
        primary: "plankton",
        scores: {
          plankton: 2,
          joker: 1
        }
      },
      {
        text: "他们觉得我很好操控，只要给点爱我就会失去边界。",
        primary: "harley",
        scores: {
          harley: 2,
          gollum: 1
        }
      },
      {
        text: "他们觉得我其实没有那么聪明，只是在装清醒。",
        primary: "light",
        scores: {
          light: 2,
          hannibal: 1
        }
      }
    ]
  },
  {
    text: "如果一段关系让你痛苦，但也让你感到强烈、特别、被需要，你更可能怎么解释它？",
    options: [
      {
        text: "越痛越说明它不是普通关系，我很难说走就走。",
        primary: "harley",
        scores: {
          harley: 2,
          gollum: 1
        }
      },
      {
        text: "我知道它有毒，但它已经像我的一部分。",
        primary: "gollum",
        scores: {
          gollum: 2,
          harley: 1
        }
      },
      {
        text: "如果我能控制节奏，它就不会再伤到我。",
        primary: "makima",
        scores: {
          makima: 2,
          homelander: 1
        }
      },
      {
        text: "痛苦会暴露真实的人，关系也是一种审讯。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          anton: 1
        }
      }
    ]
  },
  {
    text: "你面对一个腐烂的系统。里面的人彼此包庇、低效、虚伪，却还能继续运转。你知道小修小补没用，但真正推翻它会伤到很多人。\n\n你更接近哪种选择？",
    options: [
      {
        text: "如果系统烂到骨子里，就需要一个更强的人重新定义它。",
        primary: "light",
        scores: {
          light: 2,
          pain: 1
        }
      },
      {
        text: "让它也感受一次自己制造出来的痛，它才会记住。",
        primary: "pain",
        scores: {
          pain: 2,
          joker: 1
        }
      },
      {
        text: "我会找出系统真正的运行规则，再从规则缝隙里下手。",
        primary: "anton",
        scores: {
          anton: 2,
          tbag: 1
        }
      },
      {
        text: "我不想修好它，我想让所有人看见它本来就很荒唐。",
        primary: "joker",
        scores: {
          joker: 2,
          light: 1
        }
      }
    ]
  },
  {
    text: "别人评价你太冷、太现实、太不近人情。你听到后，第一反应更像哪一句？",
    options: [
      {
        text: "不是我冷，是他们对结果没有敬畏。",
        primary: "miranda",
        scores: {
          miranda: 2,
          anton: 1
        }
      },
      {
        text: "世界本来就不会因为你可怜而放过你。",
        primary: "tbag",
        scores: {
          tbag: 2,
          miranda: 1
        }
      },
      {
        text: "我只是比他们更早接受了规则。",
        primary: "anton",
        scores: {
          anton: 2,
          hannibal: 1
        }
      },
      {
        text: "他们把清醒叫冷漠，是因为他们还不够清醒。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          light: 1
        }
      }
    ]
  },
  {
    text: "你终于赢了一次。那个曾经看不起你的人沉默了，周围人也开始重新评价你。但胜利结束后，你发现自己并没有想象中那么满足。\n\n你最可能意识到什么？",
    options: [
      {
        text: "我想要的不是赢一次，而是永远不再被忽视。",
        primary: "homelander",
        scores: {
          homelander: 2,
          plankton: 1
        }
      },
      {
        text: "我证明了自己，却还想继续证明给更多人看。",
        primary: "plankton",
        scores: {
          plankton: 2,
          light: 1
        }
      },
      {
        text: "胜利没有意义，除非它能改变别人看我的方式。",
        primary: "joker",
        scores: {
          joker: 2,
          homelander: 1
        }
      },
      {
        text: "赢只是开始，真正重要的是以后规则由谁制定。",
        primary: "light",
        scores: {
          light: 2,
          miranda: 1
        }
      }
    ]
  },
  {
    text: "你最不能忍受哪种亲密关系？",
    options: [
      {
        text: "对方嘴上说爱我，却不肯把我放在第一位。",
        primary: "homelander",
        scores: {
          homelander: 2,
          harley: 1
        }
      },
      {
        text: "对方让我上头，却一直让我怀疑自己是不是被爱。",
        primary: "harley",
        scores: {
          harley: 2,
          gollum: 1
        }
      },
      {
        text: "对方明明依赖我，却还想保留太多不属于我的空间。",
        primary: "makima",
        scores: {
          makima: 2,
          homelander: 1
        }
      },
      {
        text: "对方让我觉得自己正在一点点变得不像自己。",
        primary: "gollum",
        scores: {
          gollum: 2,
          makima: 1
        }
      }
    ]
  },
  {
    text: "你有一个秘密计划。这个计划不一定体面，但如果成功，你可以摆脱现在的困境，甚至彻底翻身。唯一的问题是，它可能会利用一些信任你的人。\n\n你会怎么想？",
    options: [
      {
        text: "如果我不先活下来，谈什么良心都是空的。",
        primary: "tbag",
        scores: {
          tbag: 2,
          plankton: 1
        }
      },
      {
        text: "只要最后能成功，现在难看一点也没关系。",
        primary: "plankton",
        scores: {
          plankton: 2,
          tbag: 1
        }
      },
      {
        text: "我会把伤害控制在必要范围内，但计划必须完成。",
        primary: "light",
        scores: {
          light: 2,
          anton: 1
        }
      },
      {
        text: "只要他们愿意相信我，就说明他们本来就可以被引导。",
        primary: "makima",
        scores: {
          makima: 2,
          hannibal: 1
        }
      }
    ]
  },
  {
    text: "你突然获得一次窥见别人真实内心的机会。你能看见他们的恐惧、欲望、羞耻、谎言和脆弱。没有人知道你看见了。\n\n你最可能怎么使用这种能力？",
    options: [
      {
        text: "我会更清楚谁值得靠近，谁只是一具精致外壳。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          miranda: 1
        }
      },
      {
        text: "我会给他们刚好想要的东西，让他们主动靠过来。",
        primary: "makima",
        scores: {
          makima: 2,
          hannibal: 1
        }
      },
      {
        text: "我会判断谁有罪、谁虚伪、谁应该被纠正。",
        primary: "light",
        scores: {
          light: 2,
          anton: 1
        }
      },
      {
        text: "我会找到能让我脱身或翻盘的筹码。",
        primary: "tbag",
        scores: {
          tbag: 2,
          makima: 1
        }
      }
    ]
  },
  {
    text: "你走到人生低谷。没人看好你，计划失败，关系破碎，连你自己也开始怀疑是不是一直在自我欺骗。\n\n最能把你重新拉起来的是什么？",
    options: [
      {
        text: "我不能就这样被他们定义，我必须让他们重新看见我。",
        primary: "homelander",
        scores: {
          homelander: 2,
          joker: 1
        }
      },
      {
        text: "哪怕只剩我一个人，我也要再试一次。",
        primary: "plankton",
        scores: {
          plankton: 2,
          gollum: 1
        }
      },
      {
        text: "我会把这次痛苦整理成答案，不让它白白发生。",
        primary: "pain",
        scores: {
          pain: 2,
          light: 1
        }
      },
      {
        text: "我会先活下来，再决定该相信谁、报复谁、利用谁。",
        primary: "tbag",
        scores: {
          tbag: 2,
          anton: 1
        }
      }
    ]
  },
  {
    text: "如果你的黑暗面最终失控，它最可能以哪种方式伤害别人？",
    options: [
      {
        text: "我会要求别人不断证明爱我，不证明就惩罚。",
        primary: "homelander",
        scores: {
          homelander: 2,
          harley: 1
        }
      },
      {
        text: "我会用正确、规则或标准压到别人喘不过气。",
        primary: "miranda",
        scores: {
          miranda: 2,
          anton: 1
        }
      },
      {
        text: "我会把自己受过的痛变成让别人也痛的理由。",
        primary: "pain",
        scores: {
          pain: 2,
          joker: 1
        }
      },
      {
        text: "我会抓住一个执念不放，最后把自己和别人都拖进去。",
        primary: "gollum",
        scores: {
          gollum: 2,
          plankton: 1
        }
      }
    ]
  },
  {
    text: "最后一幕，你站在镜子前，看见自己最不愿承认的那一面。它不是完全邪恶，也不是完全无辜，只是一直在你心里等一个机会。\n\n你最不愿承认的是？",
    options: [
      {
        text: "我想被爱到像被供奉一样，不然就觉得自己会消失。",
        primary: "homelander",
        scores: {
          homelander: 2,
          makima: 1
        }
      },
      {
        text: "我有时真的想让世界为它对我的冷漠付出代价。",
        primary: "joker",
        scores: {
          joker: 2,
          pain: 1
        }
      },
      {
        text: "我并不只是想做好事，我也想成为唯一正确的人。",
        primary: "light",
        scores: {
          light: 2,
          hannibal: 1
        }
      },
      {
        text: "我害怕松手，因为有些执念已经被我误认成了自己。",
        primary: "gollum",
        scores: {
          gollum: 2,
          harley: 1
        }
      }
    ]
  }
];