const questions = [
  {
    title: "被夺走功劳",
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
    title: "亲密关系开始失控",
    text: "深夜，对方的头像亮了又暗。你的消息停在已读不回，而你刚刚看见他给另一个人的动态点了赞。你没有证据，但那种被移出中心的感觉已经出现了。你越盯着屏幕，越觉得自己正在被替换。\n\n你最可能怎么做？",
    options: [
      {
        text: "我会给他最缺的东西，让他自己走回我身边。",
        primary: "makima",
        scores: {
          makima: 2,
          homelander: 1
        }
      },
      {
        text: "我要立刻确认：你到底还要不要我？别让我像个笑话。",
        primary: "homelander",
        scores: {
          homelander: 2,
          harley: 1
        }
      },
      {
        text: "我知道这关系有毒，可越痛，我越像被它钩住。",
        primary: "gollum",
        scores: {
          gollum: 2,
          harley: 1
        }
      },
      {
        text: "我会冷下来，先看清他到底从哪一步开始变心。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          miranda: 1
        }
      }
    ]
  },
  {
    title: "被系统压过的人拿到权限",
    text: "你曾经被一套系统卡住过。流程、名单、审核、规则，每一步都说得很公平，可最后被挡在门外的人总是你。现在，你突然拿到一个没人知道的权限：你可以删除记录、改写结果、让某些人从系统里消失，而且不会留下证据。\n\n你第一反应更接近哪一种？",
    options: [
      {
        text: "既然这套系统本来就不干净，那就由我来摧毁和重建它。",
        primary: "light",
        scores: {
          light: 2,
          pain: 1
        }
      },
      {
        text: "我要让所有人知道，权限在我手里，让他们知道该信奉谁。",
        primary: "homelander",
        scores: {
          homelander: 2,
          light: 1
        }
      },
      {
        text: "把违反规则的人清除，一切都按照规则应有的样子运行。",
        primary: "anton",
        scores: {
          anton: 2,
          miranda: 1
        }
      },
      {
        text: "判断自己的筹码和别人的价值，拼出一套只为我服务的计划。",
        primary: "tbag",
        scores: {
          tbag: 2,
          plankton: 1
        }
      }
    ]
  },
  {
    title: "失败后的最后一搏",
    text: "你已经失败很多次了。计划被拆穿，努力被嘲笑，别人开始用轻蔑和嘲讽的眼神看你。你知道再来一次可能还是输，但如果停下来，他们的嘲笑和羞辱就成了正确答案。\n\n你会怎么选？",
    options: [
      {
        text: "再坚持一次，我一定会用成功证明他们是错的。",
        primary: "plankton",
        scores: {
          plankton: 2,
          homelander: 1
        }
      },
      {
        text: "体面的办法赢不了，那我就换一种更脏但更快的办法。",
        primary: "tbag",
        scores: {
          tbag: 2,
          plankton: 1
        }
      },
      {
        text: "如果他们想把我逼疯，那我就先让他们消失。",
        primary: "joker",
        scores: {
          joker: 2,
          pain: 1
        }
      },
      {
        text: "把失败拆到最细，下一次用一次完美的胜利打他们耳光。",
        primary: "miranda",
        scores: {
          miranda: 2,
          hannibal: 1
        }
      }
    ]
  },
  {
    title: "失控的瞬间",
    text: "你原本以为自己可以控制住。那个人、那件事、那个念头，平时看起来已经被你压下去了，可它只要再次出现，你的理智就开始松动。你明明知道继续靠近会让自己变得难看、敏感、反复，甚至不像自己，可身体和情绪已经先一步往前走了。\n\n最可怕的不是你失控，而是你发现：有一部分你，其实一直在等它回来。\n\n你最真实的反应是？",
    options: [
      {
        text: "我知道它会毁掉我，可它回来那一刻，我才像真的活过来。",
        primary: "gollum",
        scores: {
          gollum: 2,
          harley: 1
        }
      },
      {
        text: "我会把它抓紧一点，哪怕变得难看，也不能让它先属于别人。",
        primary: "homelander",
        scores: {
          homelander: 2,
          gollum: 1
        }
      },
      {
        text: "我不会急着反抗，我会弄懂它怎么诱惑我，再反过来驯服它。",
        primary: "makima",
        scores: {
          makima: 2,
          hannibal: 1
        }
      },
      {
        text: "我知道这很疯，但平淡地清醒着，比失控更像死掉。",
        primary: "harley",
        scores: {
          harley: 2,
          joker: 1
        }
      }
    ]
  },
  {
    title: "有人求你放过他",
    text: "你终于抓住了那个曾经伤害你的人。对方不再嚣张，甚至开始求你放过他。他说自己也有苦衷，说那时候没有选择。你看着他低头的样子，突然发现：现在规则在你手里。\n\n你会怎么做？",
    options: [
      {
        text: "他当初越线的时候，结局就已经开始了。",
        primary: "anton",
        scores: {
          anton: 2,
          light: 1
        }
      },
      {
        text: "我不用解释，我要让他亲自尝一遍。",
        primary: "pain",
        scores: {
          pain: 2,
          joker: 1
        }
      },
      {
        text: "我不急着毁掉他，我要让他知道结局在我手里。",
        primary: "makima",
        scores: {
          makima: 2,
          tbag: 1
        }
      },
      {
        text: "我不会失态，蠢人才会丢掉我给的机会。",
        primary: "miranda",
        scores: {
          miranda: 2,
          hannibal: 1
        }
      }
    ]
  },
  {
    title: "被公开羞辱",
    text: "那个人明明知道这是你的痛点，却还是用玩笑的语气把它说了出来。周围人笑了几声，又很快假装无事发生。对方还拍了拍你的肩，说“别这么敏感”。可你知道，被踩碎的不是面子，而是你给他们留下的最后一点底线。\n\n你内心最接近哪种反应？",
    options: [
      {
        text: "记住他们笑的样子，用直接暴力的方式毁掉他们。",
        primary: "joker",
        scores: {
          joker: 2,
          homelander: 1
        }
      },
      {
        text: "他暴露了自己的粗糙和低级，从此不值得我认真对待。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          miranda: 1
        }
      },
      {
        text: "他们不是体面，只是还没轮到自己被踩到痛处。",
        primary: "pain",
        scores: {
          pain: 2,
          joker: 1
        }
      },
      {
        text: "我会笑过去，但这笔账会留下，等一个最合适的时机刺回来。",
        primary: "tbag",
        scores: {
          tbag: 2,
          anton: 1
        }
      }
    ]
  },
  {
    title: "有人开始不听你的",
    text: "你带着一群人往前走，局面本来在你的掌控里。可最近，有个人开始质疑你的判断，还影响了其他人。他说自己只是提建议，但你能感觉到，那不是建议，是你的权威正在被松动。\n\n你第一反应是什么？",
    options: [
      {
        text: "我要让所有人重新知道，谁才是不可替代的。",
        primary: "homelander",
        scores: {
          homelander: 2,
          light: 1
        }
      },
      {
        text: "我会先看懂他为什么动摇，再决定怎么处理。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          makima: 1
        }
      },
      {
        text: "可以质疑，但越线就要承担后果。",
        primary: "anton",
        scores: {
          anton: 2,
          miranda: 1
        }
      },
      {
        text: "我会先看他和谁走得近，再决定拉拢还是处理。",
        primary: "tbag",
        scores: {
          tbag: 2,
          makima: 1
        }
      }
    ]
  },
  {
    title: "你听见背后的评价",
    text: "你无意间听见他们在背后谈起你。那些话不算特别恶毒，却很轻浮，很随便，像是只把你当做增进感情的工具。最刺痛你的不是他们看不起你，而是他们说这些话时那么自然，好像没把你当成人一样。\n\n你会怎么反应？",
    options: [
      {
        text: "我要迅速让他们重新知道，取笑我是多惨痛的代价。",
        primary: "homelander",
        scores: {
          homelander: 2,
          joker: 1
        }
      },
      {
        text: "既然他们这么爱聊，就让他们尝尝张不开口的滋味。",
        primary: "joker",
        scores: {
          joker: 2,
          pain: 1
        }
      },
      {
        text: "记住谁说了什么，谁附和了，谁装作没听见。算清局势。",
        primary: "tbag",
        scores: {
          tbag: 2,
          hannibal: 1
        }
      },
      {
        text: "我会把他们从心里降级，一群轻浮的人不配让我解释。",
        primary: "miranda",
        scores: {
          miranda: 2,
          hannibal: 1
        }
      }
    ]
  },
  {
    title: "被偏爱的那个人",
    text: "你看见一个人被轻易偏爱。别人会主动等他、替他解释、给他机会，甚至在他犯错时也愿意说“他不是故意的”。而你很清楚，换成你，必须表现得足够好、足够有用、足够懂事，才可能换来一点类似的待遇。最刺痛你的不是他得到了什么，而是他好像从来不需要证明自己值得。\n\n你最接近哪种反应？",
    options: [
      {
        text: "我会很想被那样选一次，不用懂事、不用证明，也有人偏向我。",
        primary: "harley",
        scores: {
          harley: 2,
          homelander: 1
        }
      },
      {
        text: "我会憋着这口气。总有一天，我要让他们知道自己偏爱错了人。",
        primary: "plankton",
        scores: {
          plankton: 2,
          pain: 1
        }
      },
      {
        text: "我会观察他怎么得到这些，再学会让别人也这样对我。",
        primary: "makima",
        scores: {
          makima: 2,
          hannibal: 1
        }
      },
      {
        text: "我会冷下来。靠偏爱活着的人，迟早会让自己一无是处。",
        primary: "miranda",
        scores: {
          miranda: 2,
          light: 1
        }
      }
    ]
  },
  {
    title: "你发现他变成了另一个人",
    text: "你曾经很了解一个人。你知道他的习惯、软肋、说谎时的小动作，也知道他什么时候会需要你。可现在，他站在你面前，说着很陌生的话，做着你预判不了的选择。他没有背叛你，只是突然变成了一个不再由你理解的人。\n\n你最接近哪种反应？",
    options: [
      {
        text: "我会重新读他，看看他的欲望换到了哪里。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          makima: 1
        }
      },
      {
        text: "为什么只有我还抓着过去的那个他不放？",
        primary: "gollum",
        scores: {
          gollum: 2,
          harley: 1
        }
      },
      {
        text: "我会拉开距离，无法预测的人不该占据核心。",
        primary: "miranda",
        scores: {
          miranda: 2,
          hannibal: 1
        }
      },
      {
        text: "我会让他想起，谁最懂他，也最能影响他。",
        primary: "makima",
        scores: {
          makima: 2,
          homelander: 1
        }
      }
    ]
  },
  {
    title: "黑暗交易",
    text: "如果有一次翻身机会摆在你面前，但它一定要拿走你身上的某样东西，你最可能接受哪一种交换？",
    options: [
      {
        text: "用一段关系的平等，换对方再也离不开你。",
        primary: "makima",
        scores: {
          makima: 2,
          homelander: 1
        }
      },
      {
        text: "用现在的体面，换一次让所有人闭嘴的胜利。",
        primary: "plankton",
        scores: {
          plankton: 2,
          joker: 1
        }
      },
      {
        text: "用别人的安全感，换一套更有效、更听话的秩序。",
        primary: "light",
        scores: {
          light: 2,
          anton: 1
        }
      },
      {
        text: "用一点良心，换在任何局面里都能如鱼得水的本事。",
        primary: "tbag",
        scores: {
          tbag: 2,
          miranda: 1
        }
      }
    ]
  },
  {
    title: "你知道正确答案，但没人听",
    text: "你已经看出问题在哪里，也知道怎么处理最快、最有效。可会议室里的人还在讨论流程、风险、感受和影响。他们说你太急、太狠、太不近人情。你看着他们争论，忽然觉得他们不是善良，只是没有能力承担正确答案。\n\n你最接近哪种想法？",
    options: [
      {
        text: "他们不敢做决定，那决定权就该交给我。",
        primary: "light",
        scores: {
          light: 2,
          miranda: 1
        }
      },
      {
        text: "越是有人求情，越要守住边界。",
        primary: "anton",
        scores: {
          anton: 2,
          light: 1
        }
      },
      {
        text: "我会等他们走进死路，再让他们回来求我的答案。",
        primary: "makima",
        scores: {
          makima: 2,
          hannibal: 1
        }
      },
      {
        text: "轮到他们承担代价时，才突然开始谈人性。",
        primary: "pain",
        scores: {
          pain: 2,
          joker: 1
        }
      }
    ]
  },
  {
    title: "看见高处的人崩溃",
    text: "那个人曾经总是站在高处评价你。他体面、稳定、正确，像从来不会出错。你也曾经解释过、忍过、低头过，可他从来没有真正把你当回事。现在他在你面前崩溃，语无伦次地解释，求你别把这件事说出去。你突然发现：原来他也会害怕，也会狼狈，也会终于轮到自己求别人放过。\n\n你第一反应是？",
    options: [
      {
        text: "人快藏不住的时候，才最真实。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          makima: 1
        }
      },
      {
        text: "痛苦才会让你长出记性，并且回到正轨。",
        primary: "pain",
        scores: {
          pain: 2,
          anton: 1
        }
      },
      {
        text: "原来他也只是一个包装得很好的普通人。",
        primary: "miranda",
        scores: {
          miranda: 2,
          light: 1
        }
      },
      {
        text: "站在他的痛点安慰他，他欠我的人情会很有用。",
        primary: "tbag",
        scores: {
          tbag: 2,
          makima: 1
        }
      }
    ]
  },
  {
    title: "你终于赢了一次",
    text: "你终于赢了。那个一直压着你、笑你、看轻你的人，这一次被你踩在脚下。周围人开始看向你，语气也变了。你忽然意识到，胜利不只是结果，它还能让人重新定义你是谁。\n\n你最真实的感觉是？",
    options: [
      {
        text: "我要让他们知道，曾经的嘲笑有多愚蠢。",
        primary: "plankton",
        scores: {
          plankton: 2,
          joker: 1
        }
      },
      {
        text: "我要让他们记住这次抬头看我的感觉。",
        primary: "homelander",
        scores: {
          homelander: 2,
          plankton: 1
        }
      },
      {
        text: "我会复盘赢在哪里，把它变成继续赢的系统。",
        primary: "miranda",
        scores: {
          miranda: 2,
          light: 1
        }
      },
      {
        text: "我不沉迷赢，我只在意它证明了哪条规则。",
        primary: "anton",
        scores: {
          anton: 2,
          hannibal: 1
        }
      }
    ]
  },
  {
    title: "你被一个温柔的人接住",
    text: "你已经很久没有相信别人了。可有个人没有急着评价你，也没有逼你变好，只是很安静地陪你走了一段。你知道自己不该贪心，但那种被接住的感觉太陌生了，陌生到你甚至开始害怕。\n\n你会怎么办？",
    options: [
      {
        text: "我想靠近，可一旦依赖，我怕自己再也离不开。",
        primary: "gollum",
        scores: {
          gollum: 2,
          homelander: 1
        }
      },
      {
        text: "他一对我好，我就想为他做点疯狂的事。",
        primary: "harley",
        scores: {
          harley: 2,
          gollum: 1
        }
      },
      {
        text: "越温柔的东西，越可能让人失去判断。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          miranda: 1
        }
      },
      {
        text: "我会试探他能不能接受真正难看的我。",
        primary: "joker",
        scores: {
          joker: 2,
          harley: 1
        }
      }
    ]
  },
  {
    title: "有人背叛了你",
    text: "你发现一个你信任过的人背叛了你。他不是完全没有理由，甚至可以说他也有自己的苦衷。可你看着证据摆在面前，心里最清楚的一点是：他知道这样会伤到你，但还是做了。\n\n你会怎么处理？",
    options: [
      {
        text: "我不听解释了，背叛之前他就该想清楚。",
        primary: "pain",
        scores: {
          pain: 2,
          anton: 1
        }
      },
      {
        text: "我会切断，可还是想知道我到底重不重要。",
        primary: "harley",
        scores: {
          harley: 2,
          homelander: 1
        }
      },
      {
        text: "我会装作不知道，等他把底牌全露出来。",
        primary: "tbag",
        scores: {
          tbag: 2,
          makima: 1
        }
      },
      {
        text: "我会一边恨他，一边想他背叛时有没有犹豫。",
        primary: "gollum",
        scores: {
          gollum: 2,
          harley: 1
        }
      }
    ]
  },
  {
    title: "他们用规则把你关进笼子",
    text: "有个人一直用规则、道德、责任或者“为你好”来压你。老板说这是职场规矩，老师说这是你的义务，家人说你不该这么自私。他们把你的反抗说成不懂事，把你的边界说成冷漠，把你的愤怒说成太极端。你越解释，他们越像站在高处审判你。\n\n某一刻，你突然意识到：他们不是在讲道理，他们是在把你关进一个看起来正确的笼子。\n\n你会怎么反应？",
    options: [
      {
        text: "如果规则只是用来关住我，那我就亲手把它拆掉。",
        primary: "pain",
        scores: {
          pain: 2,
          joker: 1
        }
      },
      {
        text: "我会找到规则真正的缝，再用它做一个让他们逃不出去的局。",
        primary: "tbag",
        scores: {
          tbag: 2,
          plankton: 1
        }
      },
      {
        text: "他们越想审判我，我越要证明决定权不该在他们手里。",
        primary: "light",
        scores: {
          light: 2,
          homelander: 1
        }
      },
      {
        text: "我不会吵。我会划出新的线，从此谁越线，谁承担后果。",
        primary: "anton",
        scores: {
          anton: 2,
          miranda: 1
        }
      }
    ]
  },
  {
    title: "反派道具",
    text: "深夜，你走进一间没有窗的房间。桌上放着四样东西，每一样都像在等你伸手。你知道它们不干净，但也知道，只要拿起其中一样，你就能得到某种一直缺失的力量。\n\n你最先看向哪一样？",
    options: [
      {
        text: "一枚能让所有人都臣服于你的徽章。",
        primary: "plankton",
        scores: {
          plankton: 2,
          homelander: 1
        }
      },
      {
        text: "一份能重新定义正确的清单。",
        primary: "light",
        scores: {
          light: 2,
          anton: 1
        }
      },
      {
        text: "一条能让某个人心甘情愿回来的细链。",
        primary: "makima",
        scores: {
          makima: 2,
          harley: 1
        }
      },
      {
        text: "一个装着自己执念的宝盒。",
        primary: "gollum",
        scores: {
          gollum: 2,
          harley: 1
        }
      }
    ]
  },
  {
    title: "你发现自己被利用了",
    text: "你回头才发现，自己一直在替别人完成他的计划。你以为自己是被信任、被需要、被特殊对待，结果只是因为你刚好好用。最刺痛你的不是损失，而是你曾经真心相信过那份特殊。\n\n你第一反应是？",
    options: [
      {
        text: "利用我可以，但不能让我觉得自己像个笑话。",
        primary: "homelander",
        scores: {
          homelander: 2,
          joker: 1
        }
      },
      {
        text: "我会拆开这段关系，学会以后怎么利用别人。",
        primary: "makima",
        scores: {
          makima: 2,
          tbag: 1
        }
      },
      {
        text: "我早该想到，人本来就不值得轻易相信。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          anton: 1
        }
      },
      {
        text: "我恨他，也恨自己还想要一个解释。",
        primary: "gollum",
        scores: {
          gollum: 2,
          harley: 1
        }
      }
    ]
  },
  {
    title: "你面对一个弱者",
    text: "一个明显比你弱的人挡在你面前。他没有太多筹码，也没有真正伤害你的能力，但他偏偏不肯退开，还用一种很坚定的眼神看着你。你知道只要你愿意，可以很轻松地让他闭嘴。\n\n你会怎么做？",
    options: [
      {
        text: "我会先听他说完，他一定有不能再退的东西。",
        primary: "hannibal",
        scores: {
          hannibal: 2,
          pain: 1
        }
      },
      {
        text: "弱者凭什么用这种眼神审判我？",
        primary: "homelander",
        scores: {
          homelander: 2,
          light: 1
        }
      },
      {
        text: "我会问清楚他为什么不退，固执也可能有用。",
        primary: "makima",
        scores: {
          makima: 2,
          tbag: 1
        }
      },
      {
        text: "强弱不重要，越线就是越线。",
        primary: "anton",
        scores: {
          anton: 2,
          miranda: 1
        }
      }
    ]
  },
  {
    title: "他们终于开始谈公平",
    text: "你曾经在一套规则里吃过很大的亏。那时候没人听你解释，也没人愿意停下来理解你的痛。现在，同一批人终于开始谈公平、谈体面、谈不要把事情做绝。你看着他们，突然觉得很讽刺：原来只有轮到他们痛的时候，世界才开始讲道理。\n\n你最接近哪种反应？",
    options: [
      {
        text: "我要让他们也尝尝无处申诉是什么滋味。",
        primary: "pain",
        scores: {
          pain: 2,
          joker: 1
        }
      },
      {
        text: "以前没人给我例外，现在也不该有人要例外。",
        primary: "anton",
        scores: {
          anton: 2,
          pain: 1
        }
      },
      {
        text: "我要把这件事摊开，让所有人看见系统怎么吞人。",
        primary: "joker",
        scores: {
          joker: 2,
          pain: 1
        }
      },
      {
        text: "我会借这次机会，把规则改到他们再也逃不掉。",
        primary: "light",
        scores: {
          light: 2,
          miranda: 1
        }
      }
    ]
  },
  {
    title: "镜子里的反派",
    text: "你站在镜子前，突然发现自己已经和以前不太一样了。不是外表变了，而是某些眼神、姿态和念头开始变得危险。你没有立刻害怕，反而有一点陌生的平静：也许这部分你一直都在，只是现在终于不想藏了。\n\n你最先注意到什么？",
    options: [
      {
        text: "眼神里那股荒唐的野心：越没人把我当回事，我越想站到所有人头上。",
        primary: "plankton",
        scores: {
          plankton: 2,
          light: 1
        }
      },
      {
        text: "嘴角那种快要笑出来的报复感。",
        primary: "joker",
        scores: {
          joker: 2,
          pain: 1
        }
      },
      {
        text: "心里还放不下的那份执念。",
        primary: "gollum",
        scores: {
          gollum: 2,
          harley: 1
        }
      },
      {
        text: "脸上那种冷静到几乎不近人情的判断。",
        primary: "miranda",
        scores: {
          miranda: 2,
          hannibal: 1
        }
      }
    ]
  },
  {
    title: "你完成了你的计划",
    text: "事情结束后，一切都安静了下来。人群散了，掌声没了，争吵也停了。你完成了你实施了很久的计划。但你也意识到，为了走到这里，你已经失去了很多。\n\n你会有什么反应？",
    options: [
      {
        text: "站到更高处。既然我证明了自己的判断，接下来就该由我决定这座城市怎么运转。",
        primary: "light",
        scores: {
          light: 2,
          plankton: 1
        }
      },
      {
        text: "紧紧守护这个成果，哪怕让我失去了太多，我也要拥有它。",
        primary: "gollum",
        scores: {
          gollum: 2,
          harley: 1
        }
      },
      {
        text: "我会笑得很夸张。失败了那么多次，终于有一次轮到世界承认我的计划成功了。",
        primary: "plankton",
        scores: {
          plankton: 2,
          joker: 1
        }
      },
      {
        text: "我会突然笑出来。都走到这一步了，痛一点、疯一点，也算我真的活过。",
        primary: "harley",
        scores: {
          harley: 2,
          joker: 1
        }
      }
    ]
  }
];